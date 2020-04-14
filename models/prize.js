var mongoose = require("mongoose");

var prizeSchema = new mongoose.Schema({
	prizename: String,
	prizepoints: String,
	invamount: String,
	prizeimage: String,
	quantity: String,
	gradeLevel: String,
	gender: String,
	type: String
	
});



module.exports = mongoose.model("Prize", prizeSchema);