var express = require('express');
var router = express.Router();
var Subjects = require('../models/subjects');
var Chapters = require('../models/chapters');
var Users = require('../models/users');
var Chatmsgs = require('../models/chatmsgs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('main');
});

router.get('/main', function(req, res, next) {
  res.render('main');
});


router.get('/todo/:id', function(req, res, next) {
  Users.findOne({ _id : req.params.id}).exec(function(err, user){
    res.render('todo',{user});
  });
});


router.get('/addSubject',function(req,res){
  res.render('addSubject');
});

router.get('/signup', function(req, res){
	res.render('signup');
});

router.post('/signup', function (req, res) {
	console.log('req confirmed', req.body);
});


router.post('/addSubject', function(req, res){
  //res.send(req.body);
  var subject = new Subjects({
    subjectName : req.body.subName,
    subjectCode : req.body.subCode,
    sem : req.body.sem,
    faculty : req.body.faculty,
    numOfChapters : req.body.numOfChapters
  });

  var promise = subject.save();
  promise.then((subject) => {
    //console.log('saved subject is',subject);
    res.render('addChapters',{subject});
  }).catch((error) => {
    console.log(error);
  });
});

router.post('/addChapters',function(req, res){
  //res.send(req.body);
  var hours = 0;
  for (var i = 0; i < (req.body.chapterName).length; i++) {
    var chapter = new Chapters({
      chapterName : req.body.chapterName[i],
      subjectCode : req.body.subjectCode[i],
      hours : req.body.hours[i],
      marks : req.body.marks[i],
      sem : req.body.sem[i],
      faculty : req.body.faculty[i]
    });

   var total_hours = total_hours + parseInt(req.body.hours[i]);


    var promise = chapter.save();
    promise.then((chapter) => {
      console.log("hours....",total_hours);
    });
  }

  Subjects.findOneAndUpdate({ subjectCode : req.body.subjectCode[0]},
  { $set : { total : total_hours }}, function(err, subject){
    console.log(subject);
  })
  res.redirect('/adminView');
});

router.get('/adminView',function(req,res){
  Subjects.find().exec(function(err, subjects){
    res.render('adminView',{subjects});
  });
});

router.get('/viewChapters/:subCode',function(req,res){
  Chapters.find({ subjectCode : req.params.subCode }).exec(function(err, chapters){
    //res.send(chapters);
    res.render('viewChapters',{chapters, subjectCode : req.params.subCode});
  })
});

router.get('/editSubject/:subCode', function(req,res){
  //res.send(req.params.subCode);
  Chapters.find({ subjectCode : req.params.subCode}).exec(function(err,chapters){
    res.render('editSubject',{chapters});
  });
})

router.post('/saveEdited', function(req, res){
  //res.send(req.body);
  console.log('req.body....', req.body);
  for(var i=0; i<req.body.num; i++){
    Chapters.findOneAndUpdate({ _id : req.body._id[i] }, { $set : {hours: req.body.hours[i], marks: req.body.marks[i], chapterName: req.body.chapterName[i]} }, (err, chapter) => {
      if(!err){
        console.log("hello");
      }else{
        console.log("Error!!",err);
      }
    });
  }
});

router.post('/setProfile',function(req, res){
  Users.findOneAndUpdate({ _id : req.body._id }, { $set : {sem: req.body.sem, faculty: req.body.faculty, deadline : req.body.deadline} },
     (err, user) => {
       console.log("h fua");
  });

  Subjects.find({ sem : req.body.sem, faculty : req.body.faculty}, (err, Usubjects) => {
    Users.findOneAndUpdate({ _id : req.body._id}, {$set : {subjects : Usubjects} },
    (err, user) => {
      console.log("subjects added");
    });
  });

  Chapters.find({ sem : req.body.sem, faculty : req.body.faculty}, (err, Uchapters) => {
    Users.findOneAndUpdate({ _id : req.body._id}, {$set : {chapters : Uchapters} },
    (err, user) => {
      res.render('examPrep',{user});
    });
  });

});

router.post('/createUser', function(req, res, next){
  //res.send(req.body);
  var user = new Users({
    username : req.body.username,
    password : req.body.password,
  });

  if(req.body.username != '' && req.body.password != '' && req.body.repassword != '') {
      if(req.body.password == req.body.repassword){
          Users.findOne({ username : req.body.username}, function(err, userCheck){
            if(userCheck == null){
              var promise = user.save();
              promise.then((user) => {
                console.log('user signed with values', user);
                res.render('bio',{user});
              });
            }else{
              console.log("Username already exists.");
            }
          });
      }
      else{
      console.log("passwords donot match");
      }
  }else{
    console.log("Please fill all the fields");
  }
});

router.post('/login',function(req,res){
  if(req.body.username && req.body.password){
    if(req.body.username == "admin" && req.body.password == "admin"){
      res.redirect('/adminView');
    }
    Users.findOne({username : req.body.username, password : req.body.password}, function(err, user){
      if(user != null){
        //console.log('Logged in with ', user);
        res.render('examPrep',{user});
      }else{
        console.log('User not valid');
      }
    });
  }else{
    console.log("Please enter username and password");
  }
});

router.get('/signup',function(req,res){
  res.render('signup');
});

router.get('/graph/:id',function(req,res){
  Users.findOne({ _id : req.params.id }).exec(function(err, user){
    //res.send(user.subjects);
    var subs = user.subjects;
    var subjects = [];
    var percent = [5,6,7];

    subs.forEach(function(s, i){
      subjects.push(s.subjectName);

      Chapters.find({ subjectCode : s.subjectCode}, function(err, chapters){
        var chTotal = 0;
        chapters.forEach(function(chapter,i){
          chTotal = chTotal + parseInt(chapter.hours);
        })

        percent.push(5);

         //console.log(chTotal*100/s.total);

      });

    });

    res.render("graph",{user,subjects,percent});
  });
});

router.post('/tickSubject',function(req,res){
  const parsedChapters = [];
  req.body.chapter.forEach((chapter, key) => {
    const parsedChapter = JSON.parse(chapter);
    const checked = req.body['studied[' + key + ']'] === 'on';
    parsedChapters.push(Object.assign({}, parsedChapter, {
      checked
    }));
  });

  //console.log(parsedChapters);

  Users.findOneAndUpdate({ _id : req.body.userId}, {$set : {chapters : parsedChapters} },
  (err, user) => {
    res.render('examPrep',{user});
  });

});

router.get('/profile/:id',function(req,res){
  Users.findOne({ _id : req.params.id}).exec(function(err, user){
    res.render('profile',{user});
  })
});

router.get('/examPrep/:id',function(req,res){
  Users.findOne({ _id : req.params.id}).exec(function(err, user){
    res.render('examPrep',{user});
    console.log(user.deadline);
  })
});

router.get('/login',function(req,res){
  res.render('index');
})

router.get('/discussion', function(req, res){
  Chatmsgs.find().exec(function(err,chatmsgs){
    res.render('discussion',{
      chatmsgs,
      forceOpen: req.query.forceOpen || false
    })
  });
});

router.post('/discussion', function(req, res){
      var chatmsg = new Chatmsgs({

        msg : req.body.msg,
      });

      var promise= chatmsg.save()
      promise.then((chatmsg)=>{
        res.redirect('/discussion?forceOpen=true');
      });
});

module.exports = router;
