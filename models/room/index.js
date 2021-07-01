const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    admin : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    roomId : {
        type : String, 
    },
    rounds : {
        type : String
    },
    words : [
        {
            type : String
        }
    ],
    users : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User'
        }
    ],
    expireAt : {
        type : Date,
        default : Date.now
    },
    cround : {
        type : String,
        default : '0'
    },
    drawingTime : {
        type : String ,
        default : '60'
    }
},{
    timestamps : true
})

const Room = mongoose.model( 'Room' , roomSchema );

module.exports = Room;