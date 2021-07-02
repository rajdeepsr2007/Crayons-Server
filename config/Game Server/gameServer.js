const socketio = require('socket.io');
const User = require('../../models/user');
const db = require('../mongoose');
const util = require('./util/util');
const config = require('./config');
const { socketToUser , activeRooms } = require('./data');

let io = null;


module.exports.createGameServer = (server) => {

    io = socketio(server , {
        cors : 'http://localhost:8000',
        credentials : true
    })

    config.configServer(io);

    io.sockets.on('connection',(socket) => {
        socket.emit('connected');
        socket.on('join-leave-room',data => {
            const userId = data.user;
            if( !socketToUser[socket.id] )
                socketToUser[socket.id] = userId;
            if( data.join ){
                util.joinRoom(socket , data );
            }else{
                util.leaveRoom(socket , data );
            }
        })

        socket.on('socket-disconnect' , () => {
            socket.disconnect();
        })

        socket.on('disconnect' , () => {

        })
    })
    
}





