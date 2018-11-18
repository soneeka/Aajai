var mongoose = require('mongoose');

const ChapterSchema = mongoose.Schema({
  chapterName : String,
  hours : Number,
  marks : Number,
  subjectCode : String,
  sem : Number,
  faculty : String
});

module.exports = mongoose.model('Chapters', ChapterSchema);
