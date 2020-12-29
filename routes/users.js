var express = require('express');
var empModel = require('../modules/employee')
var router = express.Router();
 
var employee = empModel.find({}); 
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
