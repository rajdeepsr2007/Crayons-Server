const User = require('../../models/user');
const Friend = require('../../models/friend');

module.exports.getUsers = async (req , res) => {
    try{
        const {type , value , userId} = req.params;
        const userObjects = [];
        if( type === 'search' ){
            const users = await User.find( {username : { $regex : value , $options : "si" } });
            for( const user of users ){
                const friend = await Friend.findOne({ user : userId , friend : user._id });
                userObjects.push({ ...user.toJSON() , friend : friend ? true : false })
            }
            return res.status(200).json({
                message : "Users" ,
                users : userObjects
            })
        }else{
            const user = await User.findById(value).populate('friends');
            const users = user.friends;
            for( const user of users ){
                userObjects.push({ ...user.toJSON() , friend : true })
            }
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

module.exports.toggleFriend = async (req , res) => {
    try{
        const {userId , friendId} = req.params;
        const friend = await Friend.findOne({ user : userId , friend : friendId });
        if( friend ){
            await friend.remove();
            await User.findByIdAndUpdate(userId , { $pull : { friends : friendId } });
            return res.status(200).json({
                message : "Toggle Friend" ,
                friend : false
            })
        }else{
            await Friend.create({
                user : userId ,
                friend : friendId
            })
            await User.findByIdAndUpdate(userId , {$push : { friends : friendId }});
            return res.status(200).json({
                message : "Toggle Friend" ,
                friend : true
            })
        }
    }catch(error){
        return res.status(500).json({
            message : "Something went wrong"
        })
    }
}
