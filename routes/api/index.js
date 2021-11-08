const express = require('express');
const router = express.Router();

router.use('/auth' , require('./auth') );
router.use('/room', require('./room') );
router.use('/users', require('./user'));
router.use('/profile' , require('./profile'));

module.exports = router;