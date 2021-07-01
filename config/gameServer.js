const socketio = require('socket.io');
const db = require('./mongoose');

let io = null;
const activeRooms = {};
const socketToUser = {}

module.exports.createGameServer = (server) => {

    io = socketio(server , {
        cors : 'http://localhost:8000',
        credentials : true
    })

    configServer(io);

    io.sockets.on('connection',(socket) => {

        socket.emit('connected');
        socket.on('join-rooms', data => {

            if( !socketToUser[socket.id] ){
                socketToUser[socket.id] = data.user;
            }

            const { roomIds , type } = data;
            if( type === 'basic' ){
                for( const roomId of roomIds ){
                    socket.join(
                        'game-basic-'+roomId
                    )
                }
            }
        })

        socket.on('disconnected')
    })
}

const configServer = (io) => {

    io.of("/").adapter.on("delete-room" , (room) => {
        
    })

    io.of("/").adapter.on("leave-room", (room , id) => {
        
    })

    io.of("/").adapter.on("join-room" , async (room , id) => {
        let roomId = room.substr(room.length - 6 , 6);
        if( room.substr(0,4) === 'game' ){
            if( !activeRooms[roomId] ){
                activeRooms[roomId] = await db.collection('Room').findOne({ roomId });
            }
        }
        const userId = socketToUser[id];
        if( room.substr(5,5) === 'basic' ){
            if( !activeRooms[roomId].users )
                activeRooms[roomId].users = [];
            activeRooms[roomId].users.push(
                userId
            )
            io.to(`game-basic-${roomId}`).emit('room_update',{
                roomId ,
                room : { 
                    users : activeRooms[roomId].users 
                }
            });
        }
    })
}

const getRoomId = (room) => {
    return 
}