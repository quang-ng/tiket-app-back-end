var express = require('express');
var router = express.Router();

var userController = require('../controllers/userController');

// GET catalog home page.
router.get('/', userController.userList);
router.get('/:user_id', userController.getSingleUser);
router.post("/create_user", userController.createUser)
router.post("/update_user", userController.updateUser)
router.delete('/:user_id', userController.deleteUser)

module.exports = router;
