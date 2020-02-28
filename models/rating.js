var mongoose = require("mongoose");

var ratingSchema = new mongoose.Schema({
	firstname: String,
	lastname: String,
	ratingOne: String,
	ratingTwo: String,
	ratingThree: String,
	comment: String
});



module.exports = mongoose.model("Rating", ratingSchema);