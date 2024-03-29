const Room = require("../../../models/room");
const { cleanUpMessage } = require("../../Message Server/util/util");
const { activeRooms, userToSocket } = require("../data")


module.exports.joinRoom = (socket ,  data ) => {
    if( data.type === 'info' ){
        for( const roomId of data.roomIds ){
            socket.join(
                `info${roomId}`
            )
        }
    }else{
        if( activeRooms[data.roomId] && activeRooms[data.roomId].users && activeRooms[data.roomId].users.length >= 8 ){
            return;
        }
        socket.join(
            `game${data.roomId}`
        )
    }
}




module.exports.leaveRoom = (socket , data ) => {
    if( data.type === 'info' ){
        for( const roomId of data.roomIds ){
            socket.leave(
                `info${roomId}`
            )
        }
    }else{
        socket.leave(
            `game${data.roomId}`
        )
    }
}


module.exports.sendRoomInfo = (io , roomId , to) => {

    const room = activeRooms[roomId];
    let info = {
        roomId ,
        room : {
            users : [],
            cround : 0
        }
    }
    if( room ){
        if( room.users ){
            info.room.users = room.users.map(user => user._id);
        }
        if( room.cround ){
            info.room.cround = room.cround;
        }
        const emitTo = to ? to : `info${roomId}`;
        io.to(emitTo).emit('room-update' , info);
    }
}



module.exports.sendRoomUpdate = (io , room ) => {
    io.to(`game${room.roomId}`).emit('room-update' , {room});
}

module.exports.changeHost = (io , roomId , userId) => {
    if( activeRooms[roomId] && activeRooms[roomId].users){
        const user = activeRooms[roomId].users.find( user => user._id == userId );
        if(user){
            activeRooms[roomId].admin = userId;
            this.sendRoomUpdate(io , { roomId , admin : userId });
        }
    }
}

module.exports.changeRoomVisibility = async (io , roomId , visibility) => {
    await Room.findOneAndUpdate({ roomId }, { visibility : visibility });
    if( activeRooms[roomId] ){
        activeRooms[roomId].visibility = visibility;
        this.sendRoomUpdate(io , activeRooms[roomId] );
    }
}

module.exports.removeUser = (io , userId ) => {
    const socketId = userToSocket[userId];
    io.to(socketId).emit('socket-disconnect');
}


module.exports.getRoomId = (room) => {
    return room.substr(4 , 6);
}


module.exports.getRoomType = (room) => {
    return room.substr(0,4);
}

module.exports.getOptimizedObject = (room) => {
    const optimizedRoom =  {
        ...room ,
        words : null ,
        visibility : null ,
        expireAt : null ,
        createdAt : null ,
        updatedAt : null ,
        turns : null ,
        word : null ,
        timerInterval : null
    }
    
    return optimizedRoom;
}

module.exports.cleanUpGame = (roomId) => {
    if( activeRooms[roomId] ){
        if( activeRooms[roomId].timerInterval ){
            clearInterval(activeRooms[roomId].timerInterval);
        }
        delete activeRooms[roomId];
    }
    cleanUpMessage(roomId);
}