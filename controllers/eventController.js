var Event = require('../models/event');
const logger = require('./../winston');
const { body, validationResult } = require('express-validator');

/**
 * @swagger
 *
 * /events/:
 *   get:
 *     description: list all event in the database with pagination.
 *     parameters:
 *       - name: skip
 *         description: number of event should be skipped, default is 0
 *         required: false
 *         type: number
 *       - name: limit
 *         description: number of event should be limited, default is 10
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: List of events
 */
exports.eventList = function (req, res) {
    const skip = req.query.skip || 0;
    const limit = req.query.limit || 10;
    Event.find()
        .select('-__v')
        .skip(Number(skip))
        .limit(Number(limit))
        .exec(function (err, list_events) {
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
                message: 'Fetch list of event',
                events: list_events,
            });
        });
};


/**
 * @swagger
 *
 * /events/:{event_id}:
 *   get:
 *     description: get single event by ID.
 *     parameters:
 *       - name: id
 *         description: ID of event
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: event detail information
 */
exports.getSingleEvent = function (req, res) {
    const id = req.params.event_id
    Event.findById(id)
        .select('-__v')
        .then((event) => {
            res.status(200).json({
                success: true,
                message: `More on ${event.name}`,
                event: event,
            });
        })
        .catch((err) => {
            logger.error(err);
            res.status(500).json({
                success: false,
                message: 'This event does not exist',
                error: err.message,
            });
        });
}

/**
 * @swagger
 * /events:
 *   post:
 *     description: Save event
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: event
 *         description: event object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Event'
 *     responses:
 *       200:
 *         description: Return saved event
 */
exports.createEvent = [
    // Validate and sanitise fields.
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Name must be specified.'),
    body('date', 'Date must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('location', 'Location must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('price', 'Price must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('quantity', 'Quantity must not be empty.').trim().isLength({ min: 1 }).escape(),

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
            var event = new Event(req.body);
            event.save(function (err, result) {
                if (err) {
                    logger.error(err);
                    res.status(500).json({
                        success: false,
                        message: 'Server error. Please try again.',
                        error: err,
                    });
                }
                return res.status(201).json({
                    success: true,
                    message: 'New event created successfully',
                    event: result,
                });
            });
        }
    }
];


/**
 * @swagger
 * /events/update_event?id=:{event_id}:
 *   post:
 *     description: Update event
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: event
 *         description: event object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Event'
 *     responses:
 *       200:
 *         description: Return status of updated.
 */
exports.updateEvent = function (req, res) {
    const updateObject = req.body;
    Event.findByIdAndUpdate(req.query.id, updateObject)
        .exec()
        .then(() => {
            res.status(200).json({
                success: true,
                message: 'Event is updated'
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
 * /events/:event_id:
 *   delete:
 *     description: delete select event
 *     parameters:
 *       - name: event_id
 *         description: event ID
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: Return status of updated.
 */
exports.deleteEvent = function (req, res) {
    const id = req.params.event_id
    Event.findByIdAndRemove(id)
        .exec()
        .then(() => res.status(200).json({
            success: true,
            message: 'Event is deleted'
        }))
        .catch((err) => {
            logger.error(err);
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again.'
            })
        });
}
