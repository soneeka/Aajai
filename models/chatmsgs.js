var mongoose = require('mongoose');

const ChatmsgSchema = mongoose.Schema({
  msg : String,
  sendby : String,
  // time :  new Date(),

});

module.exports = mongoose.model('Chatmsgs', ChatmsgSchema);
