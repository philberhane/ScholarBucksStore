var mongoose       = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var studentSchema = new mongoose.Schema({
	studentid: String,
	username: String,
	firstname: String,
	lastname: String,
	password: String,
	mathpts: String,
	readingpts: String,
	totalpts: String,
	school: String,
	grade: String,
	mathteacher: String,
	readingteacher: String,
	prizes: [],
	shoppingCart: []
});

studentSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Student", studentSchema);
module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}