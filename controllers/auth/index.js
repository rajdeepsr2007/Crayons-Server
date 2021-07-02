const User = require('../../models/user/index'); 

module.exports.authUser = async (req,res) => {
    try{
        const {username , password} = req.body;
        let user = await User.findOne({ username });
        if( user ){
            if( user.password === password ){
                return res.status(200).json({
                    message : 'You will be redirected to menu...',
                    userId : user._id,
                    success : true
                })
            }else{
                return res.status(200).json({
                    message : 'Username already in use',
                    success : false
                })
            }
        }else{
            user = await User.create({ 
                username ,
                password
            })
            return res.status(200).json({
                message : 'You will be redirected to menu...',
                userId : user._id ,
                success : true
            })
        }
    }catch(error){
        return res.status(500).json({
            message : 'Something went wrong'
        })
    }
}