const socketIO = require('socket.io');
const User = require('../../models/user');
const { activeRooms } = require('../Game Server/data');
const { activeUsers , socketToUser, userToRooms , userToSocket } = require('./data');

let io = null;

module.exports.createUsersServer = (server) => {

    io = socketIO( server , {
        cors : 'http://localhost:3000',
        credentials : true
    })

    io.sockets.on('connection' , socket => {
        socket.emit('connected');
        socket.on('online' , data => {
            activeUsers[data.userId] = 'online';
            socketToUser[socket.id] = data.userId;
            userToSocket[data.userId] = socket.id;
            socket.join(`user${data.userId}`);
            io.to(`user${data.userId}`).emit('users-update' , {
                users : [{
                    userId : data.userId ,
                    lastSeen : 'online'
                }]
            });
            userToRooms[data.userId] = [];
        });

        
        socket.on('join-rooms' , (data) => {
            const usersUpdate = [];
            for( const userId of data.userIds ){
                if( activeUsers[userId] ){
                    usersUpdate.push({ userId , lastSeen : activeUsers[userId] });
                    userToRooms[userId].push(`user${userId}`);
                }
                socket.join(`user${userId}`)
            }
            if( usersUpdate.length > 0 ){
                socket.emit('users-update' , {
                    users : usersUpdate
                })
            }      
        })


        socket.on('leave-rooms' , (data) => {
            const {roomIds} = data.roomIds.map( id => `user${id}` );
            for( const roomId of roomIds ){
                socket.leave(roomId);
            }
        })

        socket.on('invite-user' , async (data) => {
            const {userId , roomId , user} = data;
            const userObject = await User.findById(userId);
            if( activeUsers[user] && activeRooms[roomId] ){
                const userSocket = userToSocket[userId];
                io.to(userSocket).emit('invite', { notifications : [{...data , username : userObject.username}] } );
            }
        })


        socket.on('disconnect' , async () => {
            const userId = socketToUser[socket.id];
            for( const room of userToRooms[userId] ){
                socket.leave(room);
            }
            delete userToRooms[userId];
            delete activeUsers[userId];
            delete socketToUser[socket.id];
            const user = await User.findById(userId);
            user.lastSeen = Date.now();
            await user.save();
            io.to(`user${userId}`).emit('users-update' , { users : [{
                userId : userId ,
                lastSeen : Date.now()
            }]});
        })
    });
}