const mongoose = require("mongoose")

const ticket = new mongoose.Schema({
  channelId: { type: String },
  userId: { type: String },
  messageId: { type: String },
  asumido: { type: Boolean }
})
const model = mongoose.model('zerodata_tickets', ticket)
module.exports = model;