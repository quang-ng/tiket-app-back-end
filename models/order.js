var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * @swagger
 *
 * definitions:
 *   Order:
 *     type: object
 *     required:
 *       - user
 *       - event
 *       - order_date
 *       - quantity
 *     properties:
 *       user:
 *         type: string           
 *       event:
 *         type: string
 *       order_date:
 *         type: date
 *       quantity:
 *         type: number 
 */
const OrderSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    order_date: { type: Date, default: Date.now },
    quantity: { type: Number, min: 1 },
});
module.exports = mongoose.model('Order', OrderSchema );