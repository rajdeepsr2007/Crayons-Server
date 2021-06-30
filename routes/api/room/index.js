const express = require('express');
const router = express.Router();
const roomController = require('../../../controllers/room/index');

router.post('/create' , roomController.createRoom );

module.exports = router;