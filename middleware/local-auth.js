const User = require('../models/user/index');
const {activeUsers} = require('../config/usersServer/data');
const { getRandomColor } = require('../config/Message Server/util/util');

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
                    return res.status(200).json({
                        message : 'Invalid Credentials',
                        success : false
                    })
                }
            }else{
                const avatar = [];
                avatar.push(Math.ceil(Math.random()*4))
                avatar.push(Math.ceil(Math.random()*4))
                avatar.push(getRandomColor());
                const newUser = await User.create({ 
                    username:username_email , 
                    password ,
                    avatar ,
                    friends : []
                })

                req.user = newUser;
                next();
            }
        }
    }catch(error){
        console.log(error);
        return res.status(500).json({
            message : 'Something Went Wrong',
            success : false
        })
    }
}