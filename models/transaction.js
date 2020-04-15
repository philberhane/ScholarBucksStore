var mongoose = require("mongoose");

var transactionSchema = new mongoose.Schema({
	prizeName: String,
	studentName: String,
	quantity: String,
	date: String,
	school: String,
	grade: String
});



module.exports = mongoose.model("Transaction", transactionSchema);