var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * @swagger
 *
 * definitions:
 *   Event:
 *     type: object
 *     required:
 *       - name
 *       - date
 *       - location
 *       - price
 *       - quantity
 *     properties:
 *       name:
 *         type: string           
 *       date:
 *         type: date
 *       location:
 *         type: string
 *       price:
 *         type: number 
 *       quantity:
 *         type: number 
 */
const EventSchema = new Schema({
    name: { type: String, required: true, maxlength: 100 },
    date: { type: Date, default: Date.now },
    location: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
});

module.exports = mongoose.model('Event', EventSchema );