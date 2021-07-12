const Room = require('../../models/room');

module.exports.createRoom = async (req,res) => {
    try{
        const {words , rounds , drawingTime } = req.body;
        const room = await Room.create({
            rounds ,
            drawingTime,
            words,
            expireAt : Date.now(),
            cround : 0 ,
            users : []
        })
        
        let roomId = JSON.stringify(room._id);
        roomId = roomId.substr(roomId.length-7 , 6);
        room.roomId = roomId;
        
        await Room.updateOne({ _id : room._id },{ $set : { roomId : roomId } });
        return res.status(200).json({
            message : 'Room Created',
            roomId
        })
    }catch(error){
        return res.status(500).json({
            message : 'Something Went Wrong'
        })
    }
}


module.exports.findRooms = async (req,res) => {
    try{
        let rooms = await Room.aggregate([{ $sample : { size : 10 }}]);
        return res.status(200).json({
            message : 'Find Rooms',
            rooms
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            message : 'Something Went Wrong'
        })
    }
}

module.exports.getRoom = async (req,res) => {
    try{
        const roomId = req.params.id;
        const room = await Room.findOne({ roomId }).populate('users');
        if( room ){
            return res.status(200).json({
                message : 'Room',
                room : room,
                success : true
            })
        }else{
            return res.status(200).json({
                message : 'Room doesn\'t exist',
                success : false
            })
        }
    }catch(error){
        return res.status(500).json({
            message : 'Something Went Wrong'
        })
    }
}