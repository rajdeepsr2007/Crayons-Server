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
        type : Date
    }
},{
    timestamps : true
})

const User = mongoose.model('User',userSchema);

module.exports = User;