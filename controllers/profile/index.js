const User = require("../../models/user");
const fs = require('fs');
const imageUpload = require("../../models/user/image-upload");
const path = require('path');

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

module.exports.addAvatar = async (req,res) => {
    try{

        imageUpload(req , res , async(error ) => {

            if( error ){
                throw new Error('Something Went Wrong!');
            }

            const userId = req.user._id;
            const user = await User.findById( userId );

            if( req.file ){
                if( user.picture && fs.existsSync(path.join(__dirname , '..' , '..' , user.picture)) ){
                    await fs.unlinkSync(
                        path.join(
                            __dirname , '..' , '..' , user.picture
                        ) 
                    )
                }

                user.picture = path.join( '/uploads' , 'avatars' , req.file.filename );
                await user.save();
                return res.status(200).json({
                    message : 'Avatar Saved',
                    picture : user.picture,
                    success : true
                })
            }else{
                return res.status(200).json({
                    message : 'No File',
                    success : false
                })
            }

        });

    }catch(error){
        return res.status(500).json({
            message : error.message
        })
    }
}

module.exports.deleteAvatar = async (req,res) => {
    try{
        const user = await User.findById(req.user._id);
        if( user && user.picture ){
            user.picture = null;
            await user.save();
            const imagePath = path.join(__dirname , '..' , '..' );
            if( fs.existsSync( imagePath ) )
                fs.unlinkSync(imagePath);
        }

        return res.status(200).json({
            message : 'Avatar Deleted',
            success : true
        })

    }catch(error){
        console.log(error);
        return res.status(500).json({
            message : error.message
        })
    }
}