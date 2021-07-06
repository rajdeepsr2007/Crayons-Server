const util = require('./util/util');
const { socketToUser , activeRooms , userRooms , userToSocket} = require('./data');
const User = require('../../models/user/index');

module.exports.configServer = (io) => {

    io.of("/").adapter.on("delete-room" , (room) => {
        
    })



    io.of("/").adapter.on("leave-room", (room , id) => {
        const roomId = util.getRoomId(room);
        const roomType = util.getRoomType(room);
        const userId = socketToUser[id];
        if( roomType === 'game' ){
            delete userToSocket[userId];
            delete socketToUser[id];
            if( activeRooms[roomId] ){
                activeRooms[roomId].users = activeRooms[roomId].users.filter( user => {
                    return JSON.stringify(user._id) !== JSON.stringify(userId)
                })
                if( activeRooms[roomId].users.length > 0 ){
                    if(activeRooms[roomId].admin == userId){
                        activeRooms[roomId].admin = activeRooms[roomId].users[0]._id;
                    }
                    util.sendRoomUpdate(io , activeRooms[roomId]);
                    util.sendRoomInfo(io , roomId );
                }else{
                    util.sendRoomInfo(io , roomId );
                    delete activeRooms[roomId];
                }
            }
        }
    })



    io.of("/").adapter.on("join-room" , async (room , id) => {
        const roomId = util.getRoomId(room);
        const roomType = util.getRoomType(room);
        const userId = socketToUser[id];
        if( roomType === 'game' ){
            const user = await User.findById(userId);
            if( user ){
                if( !activeRooms[roomId] ){
                    activeRooms[roomId] = {
                        admin : userId,
                        users : [user],
                        roomId 
                    };
                }else{
                    activeRooms[roomId].users.push(user)
                }
                userToSocket[userId] = id;
                util.sendRoomUpdate(io , activeRooms[roomId] );
                util.sendRoomInfo(io , roomId );
            }
        }else{
            util.sendRoomInfo( io , roomId , id );
        }
        if( !userRooms[userId]  ){
            userRooms[userId] = [];
        }
        userRooms[userId].push(room);
    })
}