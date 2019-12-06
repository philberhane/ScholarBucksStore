var mongoose = require("mongoose");

var prizeSchema = new mongoose.Schema({
	prizename: String,
	prizepoints: String,
	invamount: String,
	prizeimage: String,
	quantity: [String]
});



module.exports = mongoose.model("Prize", prizeSchema);