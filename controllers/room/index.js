const db = require('../../config/mongoose');

db.collection('Room').createIndex({ "expireAt" : 1 }, { expireAfterSeconds : 10 } )

module.exports.createRoom = async (req,res) => {
    try{
        const {words , rounds , drawingTime , user} = req.body;
        const room = await db.collection('Room').insertOne({
            admin : user ,
            rounds ,
            drawingTime,
            words,
            expireAt : Date.now()
        });

        const roomId = room.ops[0]._id;

        return res.status(200).json({
            message : 'Room Created',
            roomId
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            message : 'Something Went Wrong'
        })
    }
}