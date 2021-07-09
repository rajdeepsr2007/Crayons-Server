const User = require('../../models/user');

module.exports.getUsers = async (req , res) => {
    try{
        const {type , value} = req.params;
        if( type === 'search' ){
            const users = await User.find( {username : { $regex : value , $options : "si" } });
            return res.status(200).json({
                message : "Users" ,
                users
            })
        }
    }catch(error){
        return res.status(500).json({
            message : "Something went wrong"
        })
    }
}