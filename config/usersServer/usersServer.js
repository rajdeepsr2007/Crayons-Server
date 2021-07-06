const socketIO = require('socket.io');
const User = require('../../models/user');
const { activeUsers , socketToUser, userToRooms } = require('./data');

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
            console.log(socketToUser);
            socket.join(`user${data.userId}`);
            io.to(`user${data.userId}`).emit('users-update' , [{
                userId : data.userId ,
                status : 'online'
            }]);
            userToRooms[data.userId] = [];
            console.log(data.userId , ' online')
        });

        
        socket.on('join-rooms' , (data) => {
            const usersUpdate = [];
            for( const userId of data.userIds ){
                if( activeUsers[userId] ){
                    usersUpdate.push({ userId , status : activeUsers[userId] })
                }
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
            io.to(`user${userId}`).emit('users-update' , [{
                userId : userId ,
                status : 'few seconds ago'
            }]);
        })
    });
}