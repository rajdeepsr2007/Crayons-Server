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


module.exports.sendRoomUpdate = (io , room) => {
    io.to(`game${room.roomId}`).emit('room-update' , {room});
    const info = {
        roomId : room._id ,
        room : {
            users : room.users.map( user => user._id )
        }
    }
    io.to(`info${room.roomId}`).emit('room-update' , info)
}

module.exports.getRoomId = (room) => {
    return room.substr(4 , 6);
}

module.exports.getRoomType = (room) => {
    return room.substr(0,4);
}