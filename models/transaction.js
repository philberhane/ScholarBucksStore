var mongoose = require("mongoose");

var transactionSchema = new mongoose.Schema({
	prizeName: String,
	studentName: String,
	quantity: String,
	date: String
});



module.exports = mongoose.model("Transaction", transactionSchema);