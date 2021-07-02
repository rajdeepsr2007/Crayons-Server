const util = require('./util/util');
const { socketToUser , activeRooms } = require('./data');
const User = require('../../models/user/index');

module.exports.configServer = (io) => {

    io.of("/").adapter.on("delete-room" , (room) => {
        
    })

    io.of("/").adapter.on("leave-room", (room , id) => {
          
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
                        users : [{...user,password : null}],
                        roomId 
                    };
                }else{
                    activeRooms[roomId].users.push({...user , password : null})
                }
                util.sendRoomUpdate(io , activeRooms[roomId])
            }
        }
    })
}