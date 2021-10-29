const User = require('../models/user/index');
const {activeUsers} = require('../config/usersServer/data');

module.exports.localAuth = async (req,res,next) => {
    try{
        const {username_email , password} = req.body;
        let user = await User.findOne({ username : username_email });
        if( user ){
            if( user.password === password ){
                if( activeUsers[user._id] )
                    return res.status(200).json({
                        message : 'You are already logged in another session',
                        success : false
                    })
                else{
                    req.user = user;
                    next();
                }
            }else{
                return res.status(200).json({
                    message : 'Invalid Credentials',
                    success : false
                })
            }
        }else{
            user = await User.findOne({ email : username_email });
            if( user ){
                if( user.password === password ){
                    if( activeUsers[user._id] )
                        return res.status(200).json({
                            message : 'You are already logged in another session',
                            success : false
                        })
                    else{
                        req.user = user;
                        next();
                    }
                }else{
                    return res.status(401).json({
                        message : 'Invalid Credentials',
                        success : false
                    })
                }
            }
        }
    }catch(error){
        return res.status(500).json({
            message : 'Something Went Wrong',
            success : false
        })
    }
}