const socketio = require('socket.io');
const util = require('./util/util');
const playUtil = require('./util/play-util');
const config = require('./config');
const { socketToUser , activeRooms , userRooms, userToSocket } = require('./data');

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
            if( !socketToUser[socket.id] && data.type === 'game' )
                socketToUser[socket.id] = userId;
            if( data.join ){
                util.joinRoom(socket , data );
            }else{
                util.leaveRoom(socket , data );
            }
        });


        socket.on('change-host' , data => {
            const {roomId , user} = data;
            util.changeHost(io ,roomId , user);
        });

        socket.on('remove-user' , data => {
            const {roomId , user} = data;
            util.removeUser(io ,  user);
        });

        socket.on('change-room-visibility' , data => {
            const {roomId , visibility} = data;
            util.changeRoomVisibility(io , roomId , visibility);
        })

        socket.on('start-game' , data => {
            const {roomId} = data;
            playUtil.updateRound( io , roomId);
        })

        socket.on('canvas-update', data => {
            playUtil.sendCanvasUpdate(io , data);
        })

        socket.on('socket-disconnect' , () => {
            socket.disconnect();
        })

        socket.on('disconnect' , () => {
            const userId = socketToUser[socket.id];
            if( userRooms[userId] )
            for( const room of userRooms[userId] ){
                socket.leave(room);
            }
            delete userRooms[userId];
            delete socketToUser[socket.id];
            delete userToSocket[userId]; 
        });
    });  
}





