const { activeRooms } = require("../data")

module.exports.joinRoom = (socket ,  data ) => {
    if( data.type === 'info' ){
        for( const roomId of data.roomIds ){
            socket.join(
                `info${roomId}`
            )
        }
    }else{
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


module.exports.getRoomId = (room) => {
    return room.substr(4 , 6);
}


module.exports.getRoomType = (room) => {
    return room.substr(0,4);
}