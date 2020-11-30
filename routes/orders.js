var express = require('express');
var router = express.Router();

var orderController = require('../controllers/orderController');

// GET catalog home page.
router.get('/', orderController.orderList);
router.get('/:order_id', orderController.getSingleOrder);
router.post("/create_order", orderController.createOrder);
router.post("/update_order", orderController.updateOrder);
router.delete('/:order_id', orderController.deleteOrder);

module.exports = router;
