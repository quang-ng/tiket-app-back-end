var Order = require('../models/order');
var Event = require('../models/event')
const { body, validationResult } = require('express-validator');
var async = require("async");
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const _ = require('underscore');

var Mutex = require('async-mutex').Mutex;
var Semaphore = require('async-mutex').Semaphore;
var withTimeout = require('async-mutex').withTimeout;

const logger = require('./../winston');

const mutex = new Mutex();

/**
 * @swagger
 *
 * /orders/:
 *   get:
 *     description: list all order in the database with pagination.
 *     parameters:
 *       - name: skip
 *         description: number of order should be skipped, default is 0
 *         required: false
 *         type: number
 *       - name: limit
 *         description: number of order should be limited, default is 10
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: List of orders
 */

exports.orderList = function (req, res) {
    const skip = req.query.skip || 0;
    const limit = req.query.limit || 10;
    Order.find()
        .select('-__v')
        .skip(Number(skip))
        .limit(Number(limit))
        .populate('user', '-__v')
        .populate('event', '-__v')
        .exec(function (err, list_order) {
            if (err) {
                logger.error(err);
                return res.status(500).json({
                    success: false,
                    message: 'Server error. Please try again.',
                    error: err,
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Fetch list of orders',
                orders: list_order,
            });
        });
};

/**
 * @swagger
 *
 * /orders/:{order_id}:
 *   get:
 *     description: get single order by ID.
 *     parameters:
 *       - name: id
 *         description: ID of order
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: order detail information
 */
exports.getSingleOrder = function (req, res) {
    const id = req.params.order_id
    Order.findById(id)
        .select('-__v')
        .populate('user', '-__v')
        .populate('event', '-__v')
        .then((order) => {
            res.status(200).json({
                success: true,
                message: `More on ${order._id}`,
                order: order,
            });
        })
        .catch((err) => {
            logger.error(err);
            res.status(500).json({
                success: false,
                message: 'This order does not exist',
                error: err.message,
            });
        });
}

/**
 * @swagger
 * /orders:
 *   post:
 *     description: Save order
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: order
 *         description: order object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Order'
 *     responses:
 *       200:
 *         description: Return saved order
 */
exports.createOrder = [
    // Validate and sanitise fields.
    body('quantity', 'Quantity must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('user', 'User must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('event', 'Event must not be empty.').trim().isLength({ min: 1 }).escape(),


    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.send({ "errors": errors.array() });
            return;
        }
        else {
            mutex
                .acquire()
                .then(function (release) {
                    async.waterfall([
                        async.apply(function (order_info, callback) {
                            // find event
                            Event.findById(order_info.event, function (err, event) {
                                if (err) return callback(err);
                                if (event == null) {
                                    callback("Not found event", null);
                                } else {
                                    callback(null, event, order_info)
                                }
                            })
                        }, req.body),
                        function (event, order_info, callback) {
                            // check soild tikets
                            Order.find({ 'event': event._id })
                                .exec(function (err, res) {
                                    if (err) {
                                        callback(err);
                                    } else {
                                        let sum = _.reduce(res, function (memo, reading) { return memo + reading.quantity; }, 0);
                                        if ((sum + Number(order_info.quantity)) > event.quantity) {
                                            callback("Not enough tiket to sold", null);
                                        } else {
                                            callback(null, order_info);
                                        }
                                    }
                                });

                        },
                        function (order_info, callback) {
                            // save order
                            var order = new Order(order_info);
                            order.save(function (err, result) {
                                if (err) {
                                    callback(err)
                                } else {
                                    callback(null, result)
                                }
                            });

                        },
                    ], function (err, result) {
                        if (err) {
                            logger.error(err);
                            return res.status(201).json({
                                success: false,
                                message: err,
                            });
                        } else {
                            return res.status(200).json({
                                success: true,
                                message: 'New order created successfully',
                                order: result,
                            });
                        }
                    });
                    release()
                });
        }
    }
];

/**
 * @swagger
 * /orders/update_order?id=:{order_id}:
 *   post:
 *     description: Update order
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: order
 *         description: order object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Order'
 *     responses:
 *       200:
 *         description: Return status of updated.
 */
exports.updateOrder = function (req, res) {
    const updateObject = req.body;
    Order.findByIdAndUpdate(req.query.id, updateObject)
        .exec()
        .then(() => {
            res.status(200).json({
                success: true,
                message: 'Order is updated'
            });
        })
        .catch((err) => {
            logger.error(err);
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again.'
            });
        })
}


/**
 * @swagger
 * /orders/:order_id:
 *   delete:
 *     description: delete select order
 *     parameters:
 *       - name: order_id
 *         description: order ID
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: Return status of updated.
 */
exports.deleteOrder = function (req, res) {
    const id = req.params.order_id
    Order.findByIdAndRemove(id)
        .exec()
        .then(() => res.status(200).json({
            success: true,
            message: 'Order is deleted'
        }))
        .catch((err) => {
            logger.error(err);
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again.'
            })
        });
}
