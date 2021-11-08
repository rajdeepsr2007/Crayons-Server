const express = require('express');
const router = express.Router();
const passport = require('passport');
const profileController = require('../../../controllers/profile/index');

router.post('/avatar' , passport.authenticate('jwt') , profileController.editAvatar );

module.exports = router;
