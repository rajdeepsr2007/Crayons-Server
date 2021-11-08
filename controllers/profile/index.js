const User = require("../../models/user");

module.exports.editAvatar = async (req,res) => {
    try{
        const { userId , avatar } = req.body;
        const user = await User.findById( userId );
        if( user ){
            user.avatar = avatar;
            await user.save();
            return res.status(200).json({
                message : "Avatar Saved",
                success : true
            })
        }else{
            throw new Error('Bad Request');
        }
    }catch(error){
        return res.status(500).json({
            message : error.message
        })
    }
}