const socketio = require('socket.io');
const db = require('./mongoose');

let io = null;

module.exports.createGameServer = (server) => {

    io = socketio(server , {
        cors : 'http://localhost:8000',
        credentials : true
    })

    configServer(io);

    io.sockets.on('connection',(socket) => {
        socket.emit('connected');

        socket.on('socket-disconnect' , () => {
            socket.disconnect();
        })

        socket.on('disconnect' , () => {

        })
    })
    
}

const configServer = (io) => {

    io.of("/").adapter.on("delete-room" , (room) => {
        
    })

    io.of("/").adapter.on("leave-room", (room , id) => {
          
    })

    io.of("/").adapter.on("join-room" , async (room , id) => {
        
    })
}

