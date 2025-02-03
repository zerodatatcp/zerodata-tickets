const mongoose = require("mongoose")

const asumidos = new mongoose.Schema({
  staffId: { type: String },
  cantidad: { type: Number }
})

const model = mongoose.model('zerodata_asumidos', asumidos)
module.exports = model;