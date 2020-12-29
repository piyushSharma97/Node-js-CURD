const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/employeeRecord', {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;
var employeeSchema = new mongoose.Schema({
    name:String,
    email:String,
    type:String,
    age:Number,
    totalHrs :Number,
    hourlyrate:Number,
    total:Number,
    image:String
})
var employeeModel  =mongoose.model('employees',employeeSchema)
module.exports = employeeModel;