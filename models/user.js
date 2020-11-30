var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * @swagger
 *
 * definitions:
 *   User:
 *     type: object
 *     required:
 *       - name
 *       - email
 *     properties:
 *       username:
 *         type: string
 *       email:
 *         type: string
 *       joinDate:
 *         type: date
 */
const UserSchema = new Schema({
  name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true },
  joinDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
