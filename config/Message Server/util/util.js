const {rooms} = require('../data');

module.exports.sendMessage = (io , data) => {
    const {roomId ,  userId , text ,  type } = data;
    const message = { userId , text };
    rooms[roomId].messages.push(message);
    io.to(`message${roomId}`).emit('messages-update', { userId , text , type } );
}

module.exports.getRandomColor = () => {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}