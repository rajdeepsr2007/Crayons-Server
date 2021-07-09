const express = require('express');
const router = express.Router();
const userController = require('../../../controllers/user/');

router.get('/friend/:userId/:friendId' , userController.toggleFriend);
router.get('/:type/:value/:userId' , userController.getUsers);

module.exports = router;