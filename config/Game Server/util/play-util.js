const { activeRooms, userToSocket } = require("../data");
const { sendRoomInfo, sendRoomUpdate } = require("./util");

module.exports.updateRound = ( io , roomId ) => {
    activeRooms[roomId].cround = parseInt(activeRooms[roomId].cround) + 1;
    sendRoomUpdate(io , activeRooms[roomId]);
    sendRoomInfo( io , roomId );
}