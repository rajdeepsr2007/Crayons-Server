const util = require('./util/util');
const { socketToUser , activeRooms , userRooms , userToSocket} = require('./data');
const User = require('../../models/user/index');
const Room = require('../../models/room/index');
const { updateQuestion } = require('./util/play-util');
const { rooms } = require('../../config/Message Server/data');

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
                    if( activeRooms[roomId].turn == userId ){
                        activeRooms[roomId].question -= 1;
                        updateQuestion(io , roomId);
                    }
                    if( activeRooms[roomId] )
                    util.sendRoomUpdate(io , { roomId ,  users : activeRooms[roomId].users});
                    util.sendRoomInfo(io , roomId );
                }else{
                    util.sendRoomInfo(io , roomId );
                    if( activeRooms[roomId].timerInterval ){
                        clearInterval(activeRooms[roomId].timerInterval);
                    }
                    delete activeRooms[roomId];
                    delete rooms[roomId]
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
                   const room = await Room.findOne({ roomId });
                   activeRooms[roomId] = {
                       ...room.toJSON(),
                       admin : user._id ,
                       users : [user] ,
                       canvasPath: '㚅툀',
                       question : 5
                   }
                }else{
                    activeRooms[roomId].users.push(user)
                }
                userToSocket[userId] = id;
                util.sendRoomUpdate(io , util.getOptimizedObject(activeRooms[roomId]) );
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