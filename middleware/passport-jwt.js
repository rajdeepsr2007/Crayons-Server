const passport = require('passport');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const User = require('../models/user/index');

const options = {
    jwtFromRequest : ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey : 'crayons',
}

passport.use(new JWTStrategy( options , async ( payload , next ) => {
    try{
        const user = await User.findById(payload._id);
        if( user ){
            return next(null,user);
        }else{
            return next(null,false)
        }
    }catch(error){
        return next(error,false)
    }
}))



passport.serializeUser( (user,next) => {
    return next(null,user._id);
})

passport.deserializeUser( async (id,next) => {
    try{
        const user = await User.findById(id);
        if(user){
            return (null,user)
        }else{
            return (null,false)
        }

    }catch(error){
        return next(error)
    }
})


module.exports = passport;
