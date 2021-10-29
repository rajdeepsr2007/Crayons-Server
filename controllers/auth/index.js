const User = require('../../models/user/index');
const { getRandomColor } = require('../../config/Message Server/util/util');
const jwt = require('jsonwebtoken');
const { activeUsers } = require('../../config/usersServer/data');

const getUserToken = async (user) => {
    const token = jwt.sign(user.toJSON(),'crayons' , {expiresIn : 3600000} );
    const userObject = {_id : user._id, username : user.username , email : user.email , avatar : user.avatar}
    return {user : userObject , token};
}

const getLoginInfo = (token , user) => {
    return {message : 'You will be redirected to menu...',
    token : token,
    userId : user._id ,
    userObject : user ,
    success : true}
}

module.exports.loginSession = async (req,res) => {
    try{
        const {user , token} = await getUserToken(req.user); 
        return res.status(200).json(getLoginInfo(token , user));
    }catch(error){
        console.log(error);
        return res.status(500).json({
            message : 'Something went wrong!',
            success : false
        })
    }
}

module.exports.autoLogin = async (req,res) => {
    try{
        if( activeUsers[req.user._id] ){
            return res.status(401).json({
                message : 'You are already logged in another session',
                success : false
            })
        }
        const {user , token} = await getUserToken(req.user);
        return res.status(200).json(getLoginInfo(token , user));
    }catch(error){
        return res.status(500).json({
            message : 'Something went wrong!',
            success : false
        })
    }
}

