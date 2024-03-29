const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username : {
        type : String ,
        required : true
    },
    password : {
        type : String ,
        required : true
    },
    lastSeen : {
        type : Date,
        default : Date.now()
    },
    friends : [
        {
            type : mongoose.Schema.Types.ObjectId
        }
    ],
    avatar : [
        {
            type : String
        }
    ],
    picture : {
        type : String,
        default : null
    }
},{
    timestamps : true
})

const User = mongoose.model('User',userSchema);

module.exports = User;