var User = require('../models/user');
const { body, validationResult } = require('express-validator');
const logger = require('./../winston');

/**
 * @swagger
 *
 * /users/:
 *   get:
 *     description: list all user in the database with pagination.
 *     parameters:
 *       - name: skip
 *         description: number of user should be skipped, default is 0
 *         required: false
 *         type: number
 *       - name: limit
 *         description: number of user should be limited, default is 10
 *         required: false
 *         type: number
 *     responses:
 *       200:
 *         description: List of users
 */
exports.userList = function (req, res) {
    const skip = req.query.skip || 0;
    const limit = req.query.limit || 10;
    User.find()
        .select('-__v')
        .skip(Number(skip))
        .limit(Number(limit))
        .exec(function (err, list_user) {
            if (err) {
                logger.error(err);
                res.status(500).json({
                    success: false,
                    message: 'Server error. Please try again.',
                    error: err,
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Fetch list of user',
                users: list_user,
            });
        });
};


/**
 * @swagger
 *
 * /users/:{user_id}:
 *   get:
 *     description: get single user by ID.
 *     parameters:
 *       - name: id
 *         description: ID of user
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: User detail information
 */
exports.getSingleUser = function (req, res) {
    const id = req.params.user_id
    User.findById(id)
        .select('-__v')
        .then((user) => {
            res.status(200).json({
                success: true,
                message: `More on ${user.name}`,
                user: user,
            });
        })
        .catch((err) => {
            logger.error(err);
            res.status(500).json({
                success: false,
                message: 'This user does not exist',
                error: err.message,
            });
        });
}


/**
 * @swagger
 * /users:
 *   post:
 *     description: Save user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: Return saved user
 */
exports.createUser = [
    // Validate and sanitise fields.
    body('name').trim().isLength({ min: 1 }).escape().withMessage('Name must be specified.')
        .isAlphanumeric().withMessage('Name has non-alphanumeric characters.'),
    body('email', 'Email must not be empty.').trim().isLength({ min: 1 }).escape(),

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
            var userDetail = {
                name: req.body.name,
                email: req.body.email,
                joinDate: req.body.joinDate,
            }
            var user = new User(userDetail);
            user.save(function (err, result) {
                if (err) {
                    logger.error(err);
                    return res.status(500).json({
                        success: false,
                        message: 'Server error. Please try again.',
                        error: err,
                    });
                }
                return res.status(201).json({
                    success: true,
                    message: 'New user created successfully',
                    user: result,
                });
            });
        }
    }
];

/**
 * @swagger
 * /users/update_user?id=:{user_id}:
 *   post:
 *     description: Update user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: Return status of updated.
 */
exports.updateUser = function (req, res) {
    const updateObject = req.body;
    User.findByIdAndUpdate(req.query.id, updateObject)
        .exec()
        .then(() => {
            res.status(200).json({
                success: true,
                message: 'User is updated'
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
 * /users/:user_id:
 *   delete:
 *     description: delete select user
 *     parameters:
 *       - name: user_id
 *         description: user ID
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: Return status of updated.
 */
exports.deleteUser = function (req, res) {
    const id = req.params.user_id
    User.findByIdAndRemove(id)
        .exec()
        .then(() => res.status(200).json({
            success: true,
            message: 'User is deleted'
        }))
        .catch((err) => {
            logger.error(err);
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again.'
            })
        });
}
