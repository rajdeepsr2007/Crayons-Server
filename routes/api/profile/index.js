const express = require('express');
const router = express.Router();
const passport = require('passport');
const profileController = require('../../../controllers/profile/index');

router.post('/avatar' , passport.authenticate('jwt') , profileController.editAvatar );
router.post('/upload' , passport.authenticate('jwt') , profileController.addAvatar );
router.get('/delete' , passport.authenticate('jwt') , profileController.deleteAvatar);

module.exports = router;
