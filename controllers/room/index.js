const db = require('../../config/mongoose');

module.exports.createRoom = async (req,res) => {
    try{
        const {words , rounds , drawingTime , user} = req.body;
        const room = await db.collection('Room').insertOne({
            rounds ,
            drawingTime,
            words,
            expireAt : Date.now(),
            cround : 0 ,
            users : []
        })
        
        let roomId = JSON.stringify(room.ops[0]._id);
        roomId = roomId.substr(roomId.length-7 , 6);
        room.roomId = roomId;
        
        await db.collection('Room').updateOne({ _id : room.ops[0]._id },{ $set : { roomId : roomId } });
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
        let rooms = await db.collection('Room').aggregate([{ $sample : { size : 10 } }]).toArray();
        return res.status(200).json({
            message : 'Find Rooms',
            rooms
        })
    }catch(error){
        return res.status(500).json({
            message : 'Something Went Wrong'
        })
    }
}