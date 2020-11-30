var express = require('express');
var router = express.Router();


var eventController = require('../controllers/eventController');

// GET catalog home page.
router.get('/', eventController.eventList);
router.get('/:event_id', eventController.getSingleEvent);
router.post("/create_event", eventController.createEvent);
router.post("/update_event", eventController.updateEvent);
router.delete('/:event_id', eventController.deleteEvent);

module.exports = router;
