const {rooms} = require('../data');

module.exports.sendMessage = (io , data) => {
    const {roomId ,  userId , text ,  type } = data;
    const message = { userId , text , type };
    rooms[roomId].messages.push(message);
    io.to(`message${roomId}`).emit('messages-update', message );
}

module.exports.getRandomColor = () => {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

module.exports.cleanUpMessage = (roomId) => {
  if( rooms[roomId] ){
    delete rooms[roomId];
  }
}