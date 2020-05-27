var bodyParser = require("body-parser"),
methodOverride = require("method-override"),
LocalStrategy  = require("passport-local"),
passportLocalMongoose = require("passport-local-mongoose"),
passport 	   = require("passport"),
mongoose       = require("mongoose"),
express        = require("express"),
User 	   	   = require("./models/user"),
Transaction 	   	   = require("./models/transaction"),
Student 	   	   = require("./models/student"),
Prize 	   	   = require("./models/prize"),
Rating 	   	   = require("./models/rating"),
multer 			= require('multer'),
moment = require('moment'),
moment = require('moment-timezone'),
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
	  if (user.password === password) {
		  return done(null, user);
	  } else {
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
   res.render("adminlanding", {accounttype:req.user.accounttype}); 
});

app.get("/uploadOrder",isLoggedIn, function(req, res){
   res.render("uploadOrder", {accounttype:req.user.accounttype}); 
});

app.get("/studentlanding", isLoggedIn, function(req, res){
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

app.post("/forgotPassword", function(req, res) {
	var email = req.body.email2
	
})

app.get("/forgotPasswordLink/5de9d73ff16dcc001790ed5e", function(req, res) {
	res.render("resetpassword", {code: "5de9d73ff16dcc001790ed5e", message: ''})
})
app.get("/forgotPasswordLink/5defeb2b03d8930017c51a95", function(req, res) {
	res.render("resetpassword", {code: "5defeb2b03d8930017c51a95", message: ''})
})

app.post("/resetPassword", function(req,res) {
	var password1 = req.body.password1
	var password2 = req.body.password2
	var code = req.body.code
	if (password1 === password2) {
		User.findOne({_id: code}, function(err, user) {
			user.setPassword(password1, function(err, user){

      user.save(function(err) {

        res.render("resetpassword", {code: code, message: "Password has been reset!"})
      })
    })
		})
	} else {
		res.render("resetpassword", {code: code, message: "Passwords do not match!"})
	}
})

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
			res.render("orders", {prizes: prizes, accounttype: req.user.accounttype});
	});
})

app.get('/transactions', isLoggedIn, function(req, res) {
	Transaction.find({}, function(err, transactions){
			res.render("transactions", {transactions: transactions.reverse(), accounttype: req.user.accounttype});
	});
})

app.post('/edittable', isLoggedIn, function(req, res) {
	Student.findOne({username: req.body.username}, function(err, foundUser){
	
	var mathpts
	var readingpts
	if (req.body.mathpts.length === 0) {
		mathpts = 0
	} else {
		mathpts = parseInt(req.body.mathpts)
	}
	if (req.body.readingpts.length === 0) {
		readingpts = 0
	} else {
		readingpts = parseInt(req.body.readingpts)
	}
		var carryOver
	if (foundUser.carryOverPts === '0' || foundUser.carryOverPts === '') {
		carryOver = 0
	} else {
		carryOver = parseInt(foundUser.carryOverPts)
	}
	var totalpts = readingpts + mathpts + carryOver
	
	Student.findOneAndUpdate({ "username": req.body.username }, { "$set": { "mathpts": mathpts.toString(), "readingpts": readingpts.toString(), "totalpts": totalpts.toString(), "startingPts": totalpts.toString(), "grade": req.body.grade,"school": req.body.school,"mathteacher": req.body.mathteacher, "readingteacher": req.body.readingteacher}}, function(err, book){
            res.redirect('/students')
})
	})
})

app.post('/edittableAll', isLoggedIn, function(req, res) {
	Student.findOne({username: req.body.username}, function(err, foundUser){
	
	var mathpts
	var readingpts
	if (req.body.mathpts.length === 0) {
		mathpts = 0
	} else {
		mathpts = parseInt(req.body.mathpts)
	}
	if (req.body.readingpts.length === 0) {
		readingpts = 0
	} else {
		readingpts = parseInt(req.body.readingpts)
	}
		var carryOver
	if (foundUser.carryOverPts === '0' || foundUser.carryOverPts === '') {
		carryOver = 0
	} else {
		carryOver = parseInt(foundUser.carryOverPts)
	}
	var totalpts = readingpts + mathpts + carryOver
	
	Student.findOneAndUpdate({ "username": req.body.username }, { "$set": { "mathpts": mathpts.toString(), "readingpts": readingpts.toString(), "totalpts": totalpts.toString(), "startingPts": totalpts.toString(), "grade": req.body.grade,"school": req.body.school,"mathteacher": req.body.mathteacher, "readingteacher": req.body.readingteacher}}, function(err, book){
            return res.send({success: true})
})
	})
})

app.post('/edittableUpload', isLoggedIn, function(req, res) {
	Student.findOne({username: req.body.username}, function(err, foundUser){
		console.log(req.body)
	if (!foundUser) {
		var mathpts
	var readingpts
	if (req.body.mathpts === '') {
		mathpts = '0'
	} else {
		mathpts = req.body.mathpts
	}
	if (req.body.readingpts === '') {
		readingpts = '0'
	} else {
		readingpts = req.body.readingpts
	}
	var totalpts = parseInt(mathpts) + parseInt(readingpts)
	totalpts = totalpts.toString()
	//create blog
	var newstudent = new Student({
		studentid: req.body.studentid,
		username: req.body.username,
		firstname: req.body.firstname,
		lastname: req.body.lastname,
		password: req.body.password,
		mathpts: req.body.mathpts,
		readingpts: req.body.readingpts,
		school: req.body.school,
		grade: req.body.grade,
		readingteacher: req.body.readingteacher,
		mathteacher: req.body.mathteacher,
		totalpts: totalpts,
		startingPts: totalpts,
		shoppingCart: [],
		prizes: [],
		carryOverPts : '0',
	})
	//totalpts: req.body.mathpts + req.body.readingpts,
	
	
	newstudent.save(function (err) {
	if (err) return handleError(err);
	return res.send({success: true});     
	})
	} else {
	var mathpts
	var readingpts
	if (req.body.mathpts.length === 0) {
		mathpts = 0
	} else {
		mathpts = parseInt(req.body.mathpts)
	}
	if (req.body.readingpts.length === 0) {
		readingpts = 0
	} else {
		readingpts = parseInt(req.body.readingpts)
	}
		var carryOver
	if (foundUser.carryOverPts === '0' || foundUser.carryOverPts === '') {
		carryOver = 0
	} else {
		carryOver = parseInt(foundUser.carryOverPts)
	}
	var totalpts = readingpts + mathpts + carryOver
	
	Student.findOneAndUpdate({ "username": req.body.username }, { "$set": { "mathpts": mathpts.toString(), "readingpts": readingpts.toString(), "totalpts": totalpts.toString(), "startingPts": totalpts.toString(), "grade": req.body.grade,"school": req.body.school,"mathteacher": req.body.mathteacher, "readingteacher": req.body.readingteacher}}, function(err, book){
            return res.send({success: true})
})
		}
	})
})

app.get("/students", isLoggedIn, function(req, res){
	if (req.user.accounttype === 'teacher') {
		Student.find({$or: [{'mathteacher': req.user.firstname + ' ' + req.user.lastname}, {'readingteacher': req.user.firstname + ' ' + req.user.lastname}]}, function(err, students){
		// if(err){
		// 	console.log("ERROR!");
		// } else {
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
			prizes.sort((a, b) => (parseInt(a.prizepoints) < parseInt(b.prizepoints)) ? -1 : 1)	
				console.log(prizes)
			res.render("shop", {prizes:prizes, totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart});
	});
		
	})

app.get("/shoppingcart", isLoggedIn, function(req, res){
			Prize.find({}, function(err, prizes){
			res.render("shoppingcart", {totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart, username: req.user.username});
	});
		
	})

app.get("/shoppingcartquantity", isLoggedIn, function(req, res){
			Prize.find({}, function(err, prizes){
			res.render("shoppingcartquantity", {totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart});
	});
		
	})

app.post("/addToCart", isLoggedIn, function(req,res) {
	// console.log(req.body)
	// console.log(req.user)
	// res.send({message : 'Success'})
	Prize.findOne({_id: req.body.id}, function(err, prize){
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

					res.send({totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart, newQuantity:newQuantity})
				}
			});
	});
})
	app.get("/increaseQuantity/:id", isLoggedIn, function(req,res) {
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

app.get("/reviews", isLoggedIn, function(req,res){
	Rating.find({}, function(err, ratings){
			res.render("reviews", {ratings: ratings, username: req.user.username, accounttype: req.user.accounttype});
	});
})

// app.post("/submitOrder",isLoggedIn, function(req, res){
//     var messages = []
//     var orderArray = req.body.orderArray

//     orderArray.forEach(function(order, index){
// 		//if (index) {

//         var username = order.username
//         var itemName = order.itemName
//         var quantity = order.quantity
//     // var message will be an object of username and message => message will be success or error
//     // actually maybe just a string
//     // Loop through array sent from client and perform the below route's order function
//     // Replace necessary values
//     // Review the functionality: are the shopping cart shit part of the req.user or student.find?
//     // -important because the teacher won't have same session info as student

//     Student.findOne({username: username}, function(err, foundUser){
// 		if (err) {
//             var message = 'Error: '+foundUser.firstname+' '+foundUser.lastname+' has unsuccessfully ordered '+quantity+' ' +itemName+ '(s). Username could not be found, please check the spelling and try again.'
//             messages.push(message)
// 			if (index === orderArray.length-1) {
//          return res.status(200).send({message : messages}); 
// 		}
// 		} else if (foundUser === null) {
//             var message = 'Error: User ' +username+ ' has unsuccessfully ordered '+quantity+' ' +itemName+ '(s). Username could not be found, please check the spelling and try again.'
//             messages.push(message)
// 			if (index === orderArray.length-1) {
//          return res.status(200).send({message : messages}); 
// 		}
// 		} else {
		
		
//         var totalcost = 0
//     //    totalcost += parseInt(item.price)*item.quantity
// 		Prize.findOne({prizename: itemName}, function(err, prize){
// 					if (err) {
//                         var message = 'Error: '+foundUser.firstname+' '+foundUser.lastname+' has unsuccessfully ordered '+quantity+' ' +itemName+ '(s). This item could not be found, please check the spelling and try again!'
//                         messages.push(message)
// 						if (index === orderArray.length-1) {
//          return res.status(200).send({message : messages}); 
// 		}
//                     } else if (prize === null) {
//                         var message = 'Error: '+foundUser.firstname+' '+foundUser.lastname+' has unsuccessfully ordered '+quantity+' ' +itemName+ '(s). This item could not be found, please check the spelling and try again!'
//                         messages.push(message)

// 						if (index === orderArray.length-1) {
//          return res.status(200).send({message : messages}); 
// 		}
                 
// 		// } else if (parseInt(quantity) > parseInt(prize.invamount)) {
// 		// 				var message = 'Error: '+foundUser.firstname+' '+foundUser.lastname+' has unsuccessfully ordered '+quantity+' ' +itemName+ '(s) due to insufficient inventory amount.'
// 		// messages.push(message)
// 		// 				if (index === orderArray.length-1) {
// 		// return res.status(200).send({message : messages}); 
// 		// }
// 		// 			} else {
		
		 
// 		if (parseInt(foundUser.totalpts) >= totalcost) {
// 			//proceed
// 			// foundUser.totalpts = (parseInt(foundUser.totalpts) - totalcost).toString()
// 			prize.invamount = (parseInt(prize.invamount) - parseInt(quantity)).toString();
// 						prize.quantity = (parseInt(prize.quantity) + parseInt(quantity)).toString();
// 						prize.save()
// 			var date = new Date()

// 			var item = {
// 				quantity: quantity,
// 				prizeName: itemName,
// 			}

// 			var transaction = new Transaction({
// 				school: foundUser.school,
// 				studentName: foundUser.firstname + ' ' + foundUser.lastname,
// 				grade: foundUser.grade,
// 				prizeName: itemName,
// 				quantity: quantity,
// 				date: date
// 	})
	
			
// 						foundUser.prizes.push(item);
// 						foundUser.totalpts = (parseInt(foundUser.totalpts) - parseInt(prize.prizepoints)).toString();
// 						Student.update({username: req.body.username}, {
// 							prizes: foundUser.prizes, 
//                             totalpts: foundUser.totalpts,
//                             shoppingCart: []
// 						}, function(err, numberAffected, rawResponse) {
// 							transaction.save(function(err){
//       if(err){
//            console.log(err);
//       }
// });
//                             var orderString = ''+foundUser.firstname+' '+foundUser.lastname+' has ordered the following:'
		
// 				orderString += '\n \n \n \n Prize: '+itemName+' \n \n Quantity: '+quantity+''
			
// 		var nodemailer = require('nodemailer');
//         var transporter = nodemailer.createTransport({
//             host: "smtp-mail.outlook.com", // hostname
//             secureConnection: false, // TLS requires secureConnection to be false
//             port: 587, // port for secure SMTP
//             auth: {
//                 user: "scholarbucks@outlook.com",
//                 pass: "BucksScholar1"
//             },
//             tls: {
//                 ciphers:'SSLv3'
//             }
//         });
// 		//wecare@innovativescholars.net
//         var mailOptions = {
//             from: 'scholarbucks@outlook.com',
//             to: 'philberhane@outlook.com',
//             subject: "New ScholarBucks Order!",
//             html: orderString
//           };
// 		// Dynamically render what they ordered ? How to loop
// 		// and do this
          
//           transporter.sendMail(mailOptions, function(error, info){
//             if (error) {
//               console.log(error);
//             } else {
          
//               var message = 'Success: '+foundUser.firstname+' '+foundUser.lastname+' has successfully ordered '+quantity+' item ' +itemName+ '(s)!'
//               messages.push(message)
// 				if (index === orderArray.length-1) {
//          return res.status(200).send({message : messages}); 
// 		}
//               //return;
//             }
//           });
						   
// 						})
			
		

// 		} else {
// 			var message = 'Error: '+foundUser.firstname+' '+foundUser.lastname+' has unsufficient points for '+quantity+' ' +itemName+ '(s).'
//             messages.push(message)
// 			if (index === orderArray.length-1) {
//          return res.status(200).send({message : messages}); 
// 		}
//         }
//     }
// 	})

//             }
//                         })
// 	//}                
// 	}) 
//  });

app.post("/orderPrizes", isLoggedIn, function(req,res){
	/* Steps from here:
	1) instead of req.user.username do req.body.username
	2) create a model in the DB called ratings that saves the user's first name, last name, and the three questions / ratings
	3) implement front end API call with the above info
	4) implement a page for the admins to view the ratings and export as excel
	*/
	
	var userFirstName
	var userLastName
	
	Student.findOne({username: req.body.username}, function(err, foundUser){
		if (err) {
			return res.render('shoppingcart', {totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart, error: "There has been an error. Please try again"})
		}
		userFirstName = foundUser.firstname
		userLastName = foundUser.lastname
		var rating = new Rating({
		firstname: foundUser.firstname,
		lastname: foundUser.lastname,
		ratingOne: req.body.ratingOne,
		ratingTwo: req.body.ratingTwo,
		ratingThree: req.body.ratingThree,
		comment: req.body.comment
	})
	
	rating.save()
		// calculate total cost
		var totalcost = 0
		foundUser.shoppingCart.forEach(function(item){totalcost += parseInt(item.price)*item.quantity
		Prize.findOne({_id: item.id}, function(err, prize){
					if (err) {
			return res.render('shoppingcart', {totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart, error: "There has been an error. Please try again"})
		}
					// if (item.quantity > parseInt(prize.invamount)) {
					// 	return res.redirect('/shoppingcartquantity')
					// }
		})
		 })
		if (parseInt(foundUser.totalpts) >= totalcost) {
			//proceed
			var temp = foundUser.totalpts
			// foundUser.totalpts = (parseInt(foundUser.totalpts) - totalcost).toString()
			var shoppingCart = foundUser.shoppingCart
			foundUser.shoppingCart.forEach(function(item, index){
				Prize.findOne({_id: item.id}, function(err, prize){
					if (err) {
			return res.render('shoppingcart', {totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart, error: "There has been an error. Please try again"})
		}			
			
						prize.invamount = (parseInt(prize.invamount) - item.quantity).toString();
						prize.quantity = (parseInt(prize.quantity) + item.quantity).toString();
						prize.save()
						foundUser.prizes.push(item);
						foundUser.totalpts = (parseInt(foundUser.totalpts) - parseInt(prize.prizepoints)).toString();

						Student.update({username: req.body.username}, {
							prizes: foundUser.prizes, 
							totalpts: foundUser.totalpts,
							carryOverPts: foundUser.totalpts
						}, function(err, numberAffected, rawResponse) {
						   if (err) {
							   return res.render('shoppingcart', {totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart, error: "There has been an error. Please try again"})
						   }
						})
				})
			})
			var shoppingcart = req.user.shoppingCart
	Student.findOneAndUpdate({username: req.user.username}, {
							shoppingCart: []
						}, function(err, foundUser) {
						   if (err) {
							   return res.render('shoppingcart', {totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart, error: "There has been an error. Please try again"})
						   }
		
		

		var orderString = '<div><div style="width: 100%"><h2 style="text-align:center">Your ScholarBucks Prize(s) have arrived!</h2><div style="width: 50%; float:left">';
		orderString += '<p>First Name: ' + foundUser.firstname + '</p>'
		orderString += '<p>Last Name: ' + foundUser.lastname + '</p>'
		orderString += '<p>School: ' + foundUser.school + '</p>'
		orderString += '<p>Grade: ' + foundUser.grade + '</p>'
		orderString += '<p>Math Teacher: ' + foundUser.mathteacher + '</p>'
		orderString += '<p>Reading Teacher: ' + foundUser.readingteacher + '</p>'
		orderString += '<p>Student Balance (before purchase): ' + temp + '</p>'
		orderString += '<p>Total cost of prizes: ' + totalcost + '</p>'
		// orderString += '</div>'
		// orderString += '<div id="brain" style="width:50%; float: right"><img style="max-width: 200px" src="https://i.imgur.com/gQUipzr.jpg"/></div></div>'
		orderString += '<br/>'
		orderString += '<p>Prize(s):</p>'
			for (i=0; i<shoppingcart.length; i++) {
				var date = moment().tz('America/Chicago').format('MMMM Do YYYY, h:mm:ss a');
				var transaction = new Transaction({
				school: foundUser.school,
				studentName: foundUser.firstname + ' ' + foundUser.lastname,
				grade: foundUser.grade,
				prizeName: shoppingcart[i].prizeName,
				quantity: shoppingcart[i].quantity,
				date: date
	})
					transaction.save()
				orderString += '<p>'+shoppingcart[i].prizeName+' </p><p>Quantity: '+shoppingcart[i].quantity+'</p>'
				if (i === shoppingcart.length-1) {
					orderString += '</div>'
					orderString += '<div style="width:50%; float: right;"><img style="max-width: 200px" src="https://i.imgur.com/gQUipzr.jpg"/></div></div>'
					orderString += '<br/><div style="text-align: center"><img src="https://i.imgur.com/0m3w5LF.jpg" style="visibility:hidden"/><h2>Remember to keep doing your best and earn Scholarbucks for your next Shopping spree!</h2><img src="https://i.imgur.com/0m3w5LF.jpg" /></div></div>'
				}
			}
		var nodemailer = require('nodemailer');
        var transporter = nodemailer.createTransport({
            host: "smtp-mail.outlook.com", // hostname
            secureConnection: false, // TLS requires secureConnection to be false
            port: 587, // port for secure SMTP
            auth: {
                user: "scholarbucks@outlook.com",
                pass: "BucksScholar1"
            },
            tls: {
                ciphers:'SSLv3'
            }
        });
		//wecare@innovativescholars.net
        var mailOptions = {
            from: 'scholarbucks@outlook.com',
            to: 'wecare@innovativescholars.net',
            subject: "New ScholarBucks Order!",
            html: orderString
          };
		// Dynamically render what they ordered ? How to loop
		// and do this
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
             return res.redirect('/orderconfirmed')
            }
          });
					
						})

		} else {
			return res.render('shoppingcart', {totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart, error: 'You do not have enough points for all of these prizes!'})
		}
	})
	
	// deduct cost from total points
	// empty shopping cart
	// deduct quantities from prize objects
	// add order to student prizes array
	// res.redirect confirmation page
})

app.get('/orderconfirmed', isLoggedIn, function(req, res) {
	return res.render("orderconfirmed", {totalpts: req.user.totalpts, shoppingCart: req.user.shoppingCart})
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
	var mathpts
	var readingpts
	if (req.body.student.mathpts.length === 0) {
		mathpts = '0'
	} else {
		mathpts = req.body.student.mathpts
	}
	if (req.body.student.readingpts.length === 0) {
		readingpts = '0'
	} else {
		readingpts = req.body.student.readingpts
	}
	var totalpts = parseInt(mathpts) + parseInt(readingpts)
	totalpts = totalpts.toString()
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
		totalpts: totalpts,
		startingPts: totalpts,
		shoppingCart: [],
		prizes: [],
		carryOverPts : '0',
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

app.get("/students/reset/:id", isLoggedIn, function(req, res){
	
   Student.findById(req.params.id, function(err, foundStudent){
       if(err){
           res.redirect("/students");
       } else {
		   foundStudent.prizes = []
		   foundStudent.totalpts= foundStudent.startingPts
		   foundStudent.carryOverPts = '0'
		   // set carryover to 0
		   foundStudent.save((err, saved) => {
			 if(err){
           res.redirect("/students");
       }
			   if (req.user.accounttype === 'teacher') {
		Student.find({$or: [{'mathteacher': req.user.firstname + ' ' + req.user.lastname}, {'readingteacher': req.user.firstname + ' ' + req.user.lastname}]}, function(err, students){
		// if(err){
		// 	console.log("ERROR!");
		// } else {
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
       }
   })
});

app.get("/prizes/:id", isLoggedIn, function(req, res){
	console.log('prize')
	
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

app.get("/prizes/:id/delete", function(req, res){
   //destroy blog
   Prize.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/prizes");
       } else {
           res.redirect("/prizes");
       }
   })
   //redirect somewhere
});

app.get("/students/:id/delete", function(req, res){
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

app.post("/students/resetAll", isLoggedIn, function(req, res){
	console.log('route reset')
	 Student.updateMany({}, {"$set":{"prizes": []}},
      function(err, result) {
        if (err) {
			console.log(err)
          return res.status(500).send({message : 'Error'})
        } else {
			 return res.status(200).send({message : 'Success'});
        }
	 })
})


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