const { activeRooms, userToSocket } = require("../data");
const { sendRoomInfo, sendRoomUpdate } = require("./util");

module.exports.updateRound = ( io , roomId ) => {
    activeRooms[roomId].cround = parseInt(activeRooms[roomId].cround) + 1;
    sendRoomUpdate(io , { roomId , cround : activeRooms[roomId].cround });
    sendRoomInfo( io , roomId );
}

module.exports.sendCanvasUpdate = (io , data) => {
    const { roomId , canvasPath } = data;
    activeRooms[roomId].canvasPath = canvasPath;
    sendRoomUpdate(io , { roomId , canvasPath });
}