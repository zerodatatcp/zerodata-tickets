const mongoose = require("mongoose");

const tempRoleSchema = new mongoose.Schema({
  userId: { type: String },
  roleId: { type: String },
  guildId: { type: String },
  expiresAt: { type: Date }
});

const model = mongoose.model('zerodata_tempRoles', tempRoleSchema);
module.exports = model;