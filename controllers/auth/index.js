const db = require('../../config/mongoose');

module.exports.authUser = async (req,res) => {
    try{
        const {username , password} = req.body;
        let user = await db.collection('User').findOne({ username });
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
            user = await db.collection('User').insertOne({ 
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
        console.log(error);
        return res.status(500).json({
            message : 'Something went wrong'
        })
    }
}