var express = require('express');
var empModel = require('../modules/employee')
var router = express.Router();
var multer = require('multer')
var path = require('path')
var jwt = require('jsonwebtoken');

var employee = empModel.find({}); 


router.use(express.static(__dirname+"./public/"));

if (typeof localStorage === "undefined" || localStorage === null) {
  const  LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

var Storage =  multer.diskStorage({ 
  destination:"./public/uploads",
  filename:(req,file,cb)=>{
cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
  }
})
var upload =multer({
  storage:Storage
}).single('file')
/* GET home page. */
router.get('/',checkLogin, function(req, res, next) {
  employee.exec(function(error,data){
    if(error) throw err;
    res.render('index', { title: 'Employee Record',records:data,success:''});
  })
  
});

function checkLogin(req,res, next){
  var myToken= localStorage.getItem('myToken');
  try{
    jwt.verify(myToken, 'loginToken');
  }catch(e){
 res.send ("you need login to access this page");
  }
  next()
}



router.get('/login',function(req, res, next){
  var token = jwt.sign({ foo: 'bar' }, 'loginToken');
  localStorage.setItem('myToken', token);
  res.send('Login Successfully')
})

router.get('/logout',function(req, res, next){
  localStorage.removeItem('myToken');
  res.send('Logout Successfully')
})

router.get('/delete/:id', function(req, res, next) {
  let uid = req.params.id
  var delemp = empModel.findByIdAndDelete(uid); 
  delemp.exec(function(error,data){
    // console.log('data',data)
    if(error) throw err;
    employee.exec(function(err,data){
      if(err) throw err;
      res.render('index', { title: 'Employee Records', records:data, success:'Record Deleted Successfully' });
        });
    // res.render('index', { title: 'Employee Record',records:data});
  })
});
router.get('/edit/:id', function(req, res, next) {
  let uid = req.params.id
  var editemp = empModel.findById(uid); 
  editemp.exec(function(error,data){
   
    if(error) throw err;
   
    res.render('edit', { title:'Employee Record Edit',records:data});
  })
});
router.post('/update/',upload, function(req, res, next) {
  // let uid = req.params.id
  // console.log(req.body)
 
  if(req.file){

    var dataRecords={
      name: req.body.uname,
        email: req.body.email,
        etype: req.body.emptype,
        hourlyrate: req.body.hrlyrate,
        totalHour: req.body.ttlhr,
        total: parseInt(req.body.hrlyrate) * parseInt(req.body.ttlhr),
        image:req.file.filename,
    }
      }else{
    
        var dataRecords={
          name: req.body.uname,
            email: req.body.email,
            etype: req.body.emptype,
            hourlyrate: req.body.hrlyrate,
            totalHour: req.body.ttlhr,
            total: parseInt(req.body.hrlyrate) * parseInt(req.body.ttlhr),
          
        }
      }
    
    
    var update= empModel.findByIdAndUpdate(req.body.id,dataRecords);
    update.exec(function(err,data){
    if(err) throw err;
    employee.exec(function(err,data){
      if(err) throw err;
      res.redirect("/");  });
      });
      
});
router.post('/',upload, function(req, res, next){
//  console.log(req.body)
  var empDetails = new empModel({
    name:req.body.uname,
    email:req.body.email,
    type:req.body.emptype,
    age:req.body.age,
    totalHrs:req.body.ttlhr,
    hourlyrate:req.body.hrlyrate,
    total:parseInt(req.body.hrlyrate)*parseInt(req.body.ttlhr),
    image:req.file.filename
  })
  empDetails.save(function(error,res1){
    if(error) throw error;
    employee.exec(function(error,data){
      if(error) throw error;
      res.render('index', { title: 'Employee Record',records:data,success :'Data insert succefully'});
    })
  })
  
})
router.post('/search/', function(req, res, next){
  
  var flrtName = req.body.fltrname;
  var flrtEmail = req.body.fltremail;
  var fltremptype = req.body.fltremptype;
  if(flrtName !='' && flrtEmail !='' && fltremptype !='' ){
    var flterParameter ={
      $and:[
        {name:flrtName},{$and:[{email:flrtEmail},{type:fltremptype}]}
      ]
    }
  }else if(flrtName !='' && flrtEmail =='' && fltremptype !=''){
    var flterParameter={ $and:[{ name:flrtName},{type:fltremptype}]
       }
  }else if(flrtName =='' && flrtEmail !='' && fltremptype !=''){
    var flterParameter={ $and:[{ email:flrtEmail},{type:fltremptype}]
       }
  }else if(flrtName =='' && flrtEmail =='' && fltremptype !=''){

    var flterParameter={type:fltremptype}
  }else{
    var flterParameter={}
  }
  // console.log('test',flterParameter)`
  var employeeFilter =empModel.find(flterParameter); 
  employeeFilter.exec(function(err,data){
    if(err) throw err;
    res.render('index', { title: 'Employee Records', records:data,success:'' });
      });
   
   
 })
 router.get('/autocomplete/', function(req, res, next){

var regex = new RegExp(req.query["term"],'i')
var employeeFilter =empModel.find({name:regex},{'name':1}).sort({"updated_at":-1}).sort({"created_at":-1}).limit(20); 
employeeFilter.exec(function(err,data){

  var result =[]
  if(!err){
    if(data && data.length && data.length>0){
      data.forEach(user => {
        let obj ={
          id:user._id,
          label:user.name
        };
        result.push(obj)
      });
    }
    console.log('data',result);
    res.jsonp(result)
  }
 
})

 })
module.exports = router;



