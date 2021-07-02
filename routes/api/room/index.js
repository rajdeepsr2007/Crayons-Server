const express = require('express');
const router = express.Router();
const roomController = require('../../../controllers/room/index');

router.post('/create' , roomController.createRoom );
router.get('/find',roomController.findRooms);
router.get('/:id',roomController.getRoom);

module.exports = router;