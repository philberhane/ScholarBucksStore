var bodyParser = require("body-parser"),
methodOverride = require("method-override"),
LocalStrategy  = require("passport-local"),
passportLocalMongoose = require("passport-local-mongoose"),
passport 	   = require("passport"),
mongoose       = require("mongoose"),
express        = require("express"),
User 	   	   = require("./models/user"),
Student 	   	   = require("./models/student"),
Prize 	   	   = require("./models/prize"),
multer 			= require('multer'),
router = express.Router()




//APP CONFIG
mongoose.connect("mongodb://heroku_1m4wfqkn:sa7n0ksoa4pcie7m60lrln744k@ds211875.mlab.com:11875/heroku_1m4wfqkn", {useNewUrlParser: true, useUnifiedTopology: true});
var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended : true}));
app.use(require("express-session")({
	secret: "One smart fellow and he felt smart",
	resave: false,
	saveUninitialized: false
}));
app.use(bodyParser.json());

//var Student = mongoose.model("Student", studentSchema);
// var upload=multer({dest:"uploads/"});

// var prizeSchema = new mongoose.Schema({
// 	prizename: String,
// 	prizepoints: String,
// 	invamount: String,
// 	prizeimage: String
// });



app.use(passport.initialize());
app.use(passport.session());

passport.use('local', new LocalStrategy(User.authenticate()));


passport.use('local-student', new LocalStrategy(function(username, password, done) {
  Student.findOne({ username: username }, function(err, user) {

    if (err) { return done(err); }
    if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
	  console.log(user)
	  if (user.password === password) {
		  console.log('successful student login')
		  return done(null, user);
	  } else {
		  console.log('unsuccessful student login')
		  return done(null, false, { message: 'Invalid password' });
	  }
  });
}));
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {

  User.findById(id, function(err, user) {
    if(err) done(err);
    if(user){
      done(null, user);  
    }else{
       Student.findById(id, function(err, user){
        if(err) done(err);
        done(null,user);
       });
    }
  });
});

app.use(express.static("public"));

app.use(methodOverride("_method"));







// MONGOOSE/MODEL CONFIG
// var studentSchema = new mongoose.Schema({
// 	firstname: String,
// 	lastname: String,
// 	email: String,
// 	passcode: String,
// 	mathpts: String,
// 	readingpts: String,
// 	school: String,
// 	grade: String,
// 	mathteacher: String,
// 	readingteacher: String
// });



// Prize.create({
// 	prizename: "Lego",
// 	prizepoints: "125",
// 	invamount: "50",
// 	prizeimage: "https://en.wikipedia.org/wiki/Lego#/media/File:LEGO_logo.svg"
	
// }, function(err , prize){
// 		if(err){
// 			console.log(err);
// 		}else{
// 			console.log("NEWLY CREATED PRIZE: ");
// 			console.log(prize);
// 		}
// 	});

//=================
//ROUTES
//=================

app.get("/", function(req, res){
	res.render("home");
});

app.get("/adminlanding",isLoggedIn, function(req, res){
	console.log(req.user);
   res.render("adminlanding", {accounttype:req.user.accounttype}); 
});

app.get("/studentlanding", isLoggedIn, function(req, res){
	console.log(req.user);
   res.render("studentlanding", {firstname:req.user.firstname, totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart}); 
});

app.get("/studentlogin", function(req, res){
   res.render("studentlogin"); 
});

app.get("/innovativescholars", function(req, res){
   res.render("innovativescholars"); 
});

app.get("/resources", function(req, res){
   res.render("resources"); 
});

app.get("/scholarbuckspage", function(req, res){
   res.render("scholarbuckspage"); 
});


app.post("/test", function(req, res){
   console.log(req.user)
});


//RESTFUL ROUTES
//AUTH ROUTES


app.get("/register", function(req, res){
	res.render("register");
});

//handling user sign up

app.post("/register", function(req, res){
    User.register(new User({username: req.body.username, firstname: req.body.firstname, lastname: req.body.lastname, accounttype: req.body.accounttype}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('register');
        }
        passport.authenticate("local")(req, res, function(){
			if (req.body.accounttype === 'teacher') {
				res.redirect("/students");
			} else {
				res.redirect("/adminlanding");
			}
        });
    });
});

// LOGIN ROUTES
//render login form
app.get("/login", function(req, res){
   res.render("login"); 
});

//login logic
//middleware
app.post("/login", passport.authenticate("local"//, {
    //successRedirect: "/adminlanding",
    //failureRedirect: "/login"
//}
) ,function(req, res){
	if (req.user.accounttype === 'teacher') {
				res.redirect("/students");
			} else {
				res.redirect("/adminlanding");
			}
});
app.post("/loginthestudent", passport.authenticate("local-student", {
    successRedirect: "/studentlanding",
    failureRedirect: "/studentlogin"
}) ,function(req, res){
});
// app.post("/loginthestudent", function(req, res){
// 	Student.find({'username': req.body.username, 'password': req.body.password}, function(err, user){
// 		if(err){
// 			console.log("ERROR!");
// 		} else {
// 			console.log(user)
// 		}
// 	});
// });






//INDEX ROUTE


// app.get("/adminlogin", function(req, res){
// 	res.render("adminlogin");
// });

// app.get("/adminlanding", isLoggedIn, function(req, res){
// 	res.render("adminlanding");
// });

app.get('/orders', isLoggedIn, function(req, res) {
	Prize.find({}, function(err, prizes){
		console.log(prizes)
			res.render("orders", {prizes: prizes, accounttype: req.user.accounttype});
	});
})

app.post('/edittable', isLoggedIn, function(req, res) {
	console.log(req.body.mathpts)
	var mathpts
	var readingpts
	console.log(req.body.readingpts)
	if (req.body.mathpts === '' || isNaN(req.body.mathpts) ) {
		mathpts = 0
	} else {
		mathpts = parseInt(req.body.mathpts)
	}
	if (req.body.readingpts === '' || isNaN(req.body.readingpts) ) {
		readingpts = 0
	} else {
		readingpts = parseInt(req.body.readingpts)
	}
	var totalpts = readingpts + mathpts
	Student.findOneAndUpdate({ "username": req.body.username }, { "$set": { "mathpts": req.body.mathpts, "readingpts": req.body.readingpts, "totalpts": totalpts.toString()}}, function(err, book){
            res.redirect('/students')
})
})

app.get("/students", isLoggedIn, function(req, res){
	if (req.user.accounttype === 'teacher') {
		Student.find({$or: [{'mathteacher': req.user.firstname + ' ' + req.user.lastname}, {'readingteacher': req.user.firstname + ' ' + req.user.lastname}]}, function(err, students){
		// if(err){
		// 	console.log("ERROR!");
		// } else {
			console.log(req.user)
			res.render("index", {students:students, accounttype:req.user.accounttype, firstname: req.user.firstname, lastname: req.user.lastname});
		//}
	});
	} else {
			Student.find({}, function(err, students){
		// if(err){
		// 	console.log("ERROR!");
		// } else {
			res.render("index", {students:students, accounttype:req.user.accounttype, firstname: req.user.firstname, lastname: req.user.lastname});
		//}
	});
		}
	})

app.get("/shop", isLoggedIn, function(req, res){

			Prize.find({}, function(err, prizes){
			prizes.sort((a, b) => (a.prizepoints < b.prizepoints) ? 1 : -1)	
			res.render("shop", {prizes:prizes, totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart});
	});
		
	})

app.get("/shoppingcart", isLoggedIn, function(req, res){
			Prize.find({}, function(err, prizes){
			res.render("shoppingcart", {totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart});
	});
		
	})

app.post("/addToCart", isLoggedIn, function(req,res) {
	// console.log(req.body)
	// console.log(req.user)
	// res.send({message : 'Success'})
	Prize.findOne({_id: req.body.id}, function(err, prize){
			console.log('found prize: ' + prize.prizename)
			Student.findOne({username: req.user.username}, function(err, foundUser){
				if (foundUser.shoppingCart.filter(e => e.id === req.body.id).length > 0) {
					var previousQuantity
					var arrayIndex
					// delete pop and loop and change quantity
					for (i=0; i<foundUser.shoppingCart.length; i++) {
						if (foundUser.shoppingCart[i].id === req.body.id) {
							previousQuantity = foundUser.shoppingCart[i].quantity
							arrayIndex = i
						}
					}
					foundUser.shoppingCart = foundUser.shoppingCart.filter(function(e){return  e.id !== req.body.id})
					var newQuantity = previousQuantity+=1
					var addedPrize = {
						id: req.body.id,
						prizeName: prize.prizename,
						prizeimage: prize.prizeimage,
						price: prize.prizepoints,
						quantity: newQuantity
					}
					foundUser.shoppingCart.splice(arrayIndex, 0, addedPrize);
					foundUser.save()
					console.log('incremented prize in cart: ' + prize.prizename)
					res.send({totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart, newQuantity:newQuantity})
					// increment count
				} else {
					var addedPrize = {
						id: req.body.id,
						prizeName: prize.prizename,
						prizeimage: prize.prizeimage,
						price: prize.prizepoints,
						quantity: 1
					}
					foundUser.shoppingCart.push(addedPrize)
					foundUser.save()
					console.log('added prize in cart: ' + prize.prizename)
					res.send({totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart, newQuantity:newQuantity})
				}
			});
	});
})
	app.get("/increaseQuantity/:id", isLoggedIn, function(req,res) {
		console.log('params ' +req.params.id)
		Prize.findOne({_id: req.params.id}, function(err, prize){
			Student.findOne({username: req.user.username}, function(err, foundUser){
				var previousQuantity
				var arrayIndex
				for (i=0; i<foundUser.shoppingCart.length; i++) {
							if (foundUser.shoppingCart[i].id === req.params.id) {
								previousQuantity = foundUser.shoppingCart[i].quantity
								arrayIndex = i
							}
					}
				var newQuantity = previousQuantity+=1
				
				foundUser.shoppingCart = foundUser.shoppingCart.filter(function(e){return  e.id !== req.params.id})
				var addedPrize = {
							id: req.params.id,
							prizeName: prize.prizename,
							prizeimage: prize.prizeimage,
							price: prize.prizepoints,
							quantity: newQuantity
					}
				foundUser.shoppingCart.splice(arrayIndex, 0, addedPrize);
				foundUser.save()
				res.redirect('/shoppingcart')
		})
	})
		
	})

app.get("/decreaseQuantity/:id", isLoggedIn, function(req,res) {
		console.log('params ' +req.params.id)
		Prize.findOne({_id: req.params.id}, function(err, prize){
			Student.findOne({username: req.user.username}, function(err, foundUser){
				var previousQuantity
				var arrayIndex
				for (i=0; i<foundUser.shoppingCart.length; i++) {
							if (foundUser.shoppingCart[i].id === req.params.id) {
								previousQuantity = foundUser.shoppingCart[i].quantity
								arrayIndex = i
							}
					}
				var newQuantity = previousQuantity-=1
				
				foundUser.shoppingCart = foundUser.shoppingCart.filter(function(e){return  e.id !== req.params.id})
				if (newQuantity>0) {
				var addedPrize = {
							id: req.params.id,
							prizeName: prize.prizename,
							prizeimage: prize.prizeimage,
							price: prize.prizepoints,
							quantity: newQuantity
					}
				foundUser.shoppingCart.splice(arrayIndex, 0, addedPrize);
				}
				foundUser.save()
				res.redirect('/shoppingcart')
		})
	})
	})

app.get("/orderPrizes", isLoggedIn, function(req,res){
	Student.findOne({username: req.user.username}, function(err, foundUser){
		if (err) {
			res.render('shoppingcart', {totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart, error: "There has been an error. Please try again"})
		}
		// calculate total cost
		var totalcost = 0
		foundUser.shoppingCart.forEach(function(item){totalcost += parseInt(item.price)*item.quantity
		Prize.findOne({_id: item.id}, function(err, prize){
					if (err) {
			res.render('shoppingcart', {totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart, error: "There has been an error. Please try again"})
		}
					if (item.quantity > parseInt(prize.invamount)) {
						res.render('shoppingcart', {totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart, error: "You are ordering more "+prize.invamount+" than what is available. Please reduce the quantity and try again."})
					}
		})
		 })
		if (parseInt(foundUser.totalpts) >= totalcost) {
			//proceed
			// foundUser.totalpts = (parseInt(foundUser.totalpts) - totalcost).toString()
	
			foundUser.shoppingCart.forEach(function(item, index){
				Prize.findOne({_id: item.id}, function(err, prize){
					if (err) {
			res.render('shoppingcart', {totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart, error: "There has been an error. Please try again"})
		}
						prize.invamount = (parseInt(prize.invamount) - item.quantity).toString();
						prize.quantity = (parseInt(prize.quantity) + item.quantity).toString();
						prize.save()
						foundUser.prizes.push(item);
						foundUser.totalpts = (parseInt(foundUser.totalpts) - parseInt(prize.prizepoints)).toString();
						Student.update({username: req.user.username}, {
							prizes: foundUser.prizes, 
							totalpts: foundUser.totalpts
						}, function(err, numberAffected, rawResponse) {
						   if (err) {
							   res.render('shoppingcart', {totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart, error: "There has been an error. Please try again"})
						   }
						})
				})
			})
			foundUser.shoppingCart = []
			foundUser.save();

			res.redirect('/orderconfirmed')
		} else {
			res.render('shoppingcart', {totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart, error: 'You do not have enough points for all of these prizes!'})
		}
	})
	// deduct cost from total points
	// empty shopping cart
	// deduct quantities from prize objects
	// add order to student prizes array
	// res.redirect confirmation page
})

app.get('/orderconfirmed', isLoggedIn, function(req, res) {
	res.render("orderconfirmed", {totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart})
})
	

app.get("/prizes", isLoggedIn, function(req, res){
	Prize.find({}, function(err, prizes){
		if(err){
			console.log("ERROR!");
		} else {
			res.render("prize", {prizes:prizes, accounttype:req.user.accounttype});
		}
	});
	
});

app.get("/prizeorder", isLoggedIn, function(req, res){
	
	Prize.find({}, function(err, prizes){
		if(err){
			console.log("ERROR!");
		} else {
			res.render("prizeorder", {prizes:prizes, accounttype:req.user.accounttype});
		}
	});
	
});

app.get("/editprize", isLoggedIn, function(req, res){
	
	Prize.find({}, function(err, prizes){
		if(err){
			console.log("ERROR!");
		} else {
			res.render("editprize", {prizes:prizes, accounttype:req.user.accounttype});
		}
	});
	
});

//NEW ROUTE
app.get("/students/new", isLoggedIn, function(req, res){
	res.render("new", {accounttype:req.user.accounttype});
});

app.get("/prizes/new", isLoggedIn, function(req, res){
	res.render("newprize", {accounttype:req.user.accounttype});
});


//CREATE ROUTE

app.post("/students", isLoggedIn, function(req, res){
	console.log(req.body)
	var totalpts = parseInt(req.body.student.mathpts) + parseInt(req.body.student.readingpts)
	//create blog
	var newstudent = new Student({
		studentid: req.body.student.studentid,
		username: req.body.student.username,
		firstname: req.body.student.firstname,
		lastname: req.body.student.lastname,
		password: req.body.student.password,
		mathpts: req.body.student.mathpts,
		readingpts: req.body.student.readingpts,
		school: req.body.student.school,
		grade: req.body.student.grade,
		readingteacher: req.body.student.readingteacher,
		mathteacher: req.body.student.mathteacher,
		totalpts: totalpts.toString(),
		shoppingCart: [],
		prizes: []
	})
	//totalpts: req.body.mathpts + req.body.readingpts,
	
	
	newstudent.save(function (err) {
	if (err) return handleError(err);
	res.redirect("/students");     
	})
	
// 	Student.create(req.body.student, function(err, newStudent){
// 		if(err){
// 			res.render("new");
// 		}else {
// 			//redirect to the index page
			
// 		}
// 	});
// 	Student.update({username: req.body.username}, {
//     username: newUser.username, 
//     password: newUser.password, 
//     rights: newUser.rights
// }, function(err, numberAffected, rawResponse) {
//    //handle it
// 		res.redirect("/students");
// })
	
	});

app.post("/prizes", isLoggedIn, function(req, res){
	console.log(req.body.prize)
	//create blog
	Prize.create(req.body.prize, function(err, newPrize){
		if(err){
			res.render("newprize", {accounttype:req.user.accounttype});
		}else {
			//redirect to the index page
			res.redirect("/prizes");
		}
	});
	});

// app.post("/prizes", isLoggedIn, upload.single("image"), function(req, res){
// 	console.log(req.file)
// 	//create blog
// 	Prize.create({prizename: req.body.prizename, prizepoints: req.body.prizepoints, invamount: req.body.invamount, prizeimage: '/uploads/' + req.file.filename}, function(err, newPrize){
// 		if(err){
// 			res.render("newprize");
// 		}else {
// 			//redirect to the index page
// 			res.redirect("/prizes");
// 		}
// 	});
// 	});

//SHOW ROUTE

app.get("/students/:id", isLoggedIn, function(req, res){
	
   Student.findById(req.params.id, function(err, foundStudent){
       if(err){
           res.redirect("/students");
       } else {
           res.render("show", {student: foundStudent, accounttype:req.user.accounttype});
       }
   })
});

app.get("/prizes/:id", isLoggedIn, function(req, res){
	
   Prize.findById(req.params.id, function(err, foundPrize){
       if(err){
           res.redirect("/prizes");
       } else {
           res.render("showprize", {prize: foundPrize, accounttype:req.user.accounttype});
       }
   })
});

/// EDIT ROUTE
app.get("/students/:id/edit", isLoggedIn, function(req, res){
    Student.findById(req.params.id, function(err, foundStudent){
        if(err){
            res.redirect("/students");
        } else {
            res.render("edit", {student: foundStudent, accounttype:req.user.accounttype});
        }
    });
})

app.get("/prizes/:id/edit", isLoggedIn, function(req, res){
	console.log(req.params)
    Prize.findById(req.params.id, function(err, foundPrize){
        if(err){
            res.redirect("/prizes");
        } else {
            res.render("editprize", {prize: foundPrize, accounttype:req.user.accounttype});
        }
    });
})


// UPDATE ROUTE
app.put("/students/:id", function(req, res){
	var totalpts = parseInt(req.body.student.mathpts) + parseInt(req.body.student.readingpts)
	//create blog
   //  req.body.student.body = req.sanitize(req.body.student.body)
	// req.params.id, {params}
   Student.findByIdAndUpdate(req.params.id, {
		studentid: req.body.student.studentid,
		username: req.body.student.username,
		firstname: req.body.student.firstname,
		lastname: req.body.student.lastname,
		password: req.body.student.password,
		mathpts: req.body.student.mathpts,
		readingpts: req.body.student.readingpts,
		school: req.body.student.school,
		grade: req.body.student.grade,
		readingteacher: req.body.student.readingteacher,
		mathteacher: req.body.student.mathteacher,
		totalpts: totalpts.toString()
	}, function(err, updatedStudent){
      if(err){
          res.redirect("/students");
      }  else {
          res.redirect("/students/");
      }
   });
});

app.put("/prizes/:id", function(req, res){
	
   //  req.body.student.body = req.sanitize(req.body.student.body)
   Prize.findByIdAndUpdate(req.params.id, req.body.prize, function(err, updatedPrize){
      if(err){
          res.redirect("/prizes");
      }  else {
          res.redirect("/prizes/");
      }
   });
});



// DELETE ROUTE
app.delete("/students/:id", function(req, res){
   //destroy blog
   Student.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/students");
       } else {
           res.redirect("/students");
       }
   })
   //redirect somewhere
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/");
}






var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server started!");
});