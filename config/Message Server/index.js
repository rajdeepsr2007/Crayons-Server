const socketIO = require('socket.io');
const User = require('../../models/user');
const {activeUsers, socketToUser, rooms} = require('./data');
const { getRandomColor } = require('./util/util');

let io = null;

module.exports.createMessageServer = (server) => {
    io = socketIO( server , {
        cors : 'http://localhost:3000',
        credentials : true
    });

    io.sockets.on('connection' , socket => {
        socket.emit('connected');
        socket.on('join-room', async data => {
            const userId = data.user;
            const {roomId} = data;
            const user = await User.findById(userId);
            if( user ){
                if( !rooms[roomId] ){
                    rooms[roomId] = {
                        users : {} ,
                        messages : []
                    }
                }
                const userObject =  { userId , username : user.username , color : getRandomColor() }
                rooms[roomId].users[userId] = userObject;
                socket.join(`message${roomId}`);
                socketToUser[socket.id] = { userId , room : roomId , username : user.username } ;
                socket.emit('users-messages-update' , {
                    users : rooms[roomId].users ,
                    messages : rooms[roomId].messages
                })
                io.emit('users-update',{
                    user : userObject 
                })
            }
        });

        socket.on('new-message' , (data) => {
            const {roomId} = data;
            const { userId , text } = data;
            const message = { userId , text };
            rooms[roomId].messages.push(message);
            io.to(`message${roomId}`).emit('messages-update', { userId , text } );
        })

        socket.on('socket-disconnect' , () => {
            socket.disconnect();
        })

        socket.on('disconnect' , () => {
            const room = socketToUser[socket.id].room;
            socket.leave(`message${room}`);
            delete socketToUser[socket.id];
        })
    })
}
