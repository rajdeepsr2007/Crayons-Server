const express = require('express');
const passport = require('passport');
const authController = require('../../../controllers/auth/');
const { localAuth } = require('../../../middleware/local-auth');
const router = express.Router();

router.post('/' , localAuth , authController.loginSession );
router.post('/auto' , passport.authenticate('jwt') , authController.autoLogin );

module.exports = router;