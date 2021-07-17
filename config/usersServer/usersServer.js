const socketIO = require('socket.io');
const User = require('../../models/user');
const { activeRooms } = require('../Game Server/data');
const { activeUsers , socketToUser, userToRooms , userToSocket } = require('./data');

let io = null;

module.exports.updateLastSeen = (userId , lastSeen) => {
    if( lastSeen === 'online' || lastSeen === 'In a game' ){
        activeUsers[userId] = lastSeen;
    }
    io.to(`user${userId}`).emit('users-update' , {
        users : [{
            userId : userId ,
            lastSeen : lastSeen
        }]
    });
}

module.exports.createUsersServer = (server) => {

    io = socketIO( server , {
        cors : process.env.REACT_APP || 'http://localhost:3000',
        credentials : true
    })

    //confif(io);

    io.sockets.on('connection' , socket => {
        socket.emit('connected');
        socket.on('online' , data => {
            socketToUser[socket.id] = data.userId;
            userToSocket[data.userId] = socket.id;
            socket.join(`user${data.userId}`);
            userToRooms[data.userId] = [];
            this.updateLastSeen( data.userId , 'online' );
        });

        
        socket.on('join-rooms' , (data) => {
            const usersUpdate = [];
            const user = socketToUser[socket.id];
            for( const userId of data.userIds ){
                if( activeUsers[userId] ){
                    usersUpdate.push({ userId , lastSeen : activeUsers[userId] });
                }
                userToRooms[user].push(`user${userId}`);
                socket.join(`user${userId}`)
            }
            if( usersUpdate.length > 0 ){
                socket.emit('users-update' , {
                    users : usersUpdate
                })
            }
        })


        socket.on('leave-rooms' , () => {
            const userId = socketToUser[socket.id];
            for( const roomId of userToRooms[userId] ){
                socket.leave(roomId);
            }
            userToRooms[userId] = [];
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
            if( userToRooms[userId] )
            for( const room of userToRooms[userId] ){
                socket.leave(room);
            }
            delete userToRooms[userId];
            delete activeUsers[userId];
            delete socketToUser[socket.id];
            delete userToSocket[userId];
            const user = await User.findById(userId);
            if( user ){
                user.lastSeen = Date.now();
                await user.save();
                this.updateLastSeen( userId , Date.now() );
            }
        })
    });
}

const confif = (io) => {
    io.of("/").adapter.on('join-room' , (room , id) => {
        console.log(room , socketToUser[id] , userToRooms[socketToUser[id]]);
    })
    io.of("/").adapter.on('leave-room' , (room , id) => {
        console.log(room , socketToUser[id] , userToRooms[socketToUser[id]]);
    })
}