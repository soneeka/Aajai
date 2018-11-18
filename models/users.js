var mongoose = require('mongoose');

const UsersSchema = mongoose.Schema({
  username : String,
  password : String,
  rememberPw : Boolean,
  sem : Number,
  faculty : String,
  subjects : [{
    subjectName : String,
    subjectCode : String,
    total : Number
  }],
  percent : [{
    chPercent : Number
  }],
  chapters : [{
    chapterName : String,
    subjectCode : String,
    hours : Number,
    marks : Number,
    checked : {
        type : Boolean,
        default : 0
      }
  }],
  todo : [{
    lists : String
  }],
  deadline : Date,
});

module.exports = mongoose.model('Users', UsersSchema);
