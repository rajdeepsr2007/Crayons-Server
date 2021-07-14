const { messageIO } = require("../../Message Server/data");
const { sendMessage } = require("../../Message Server/util/util");
const { activeRooms, userToSocket , words } = require("../data");
const { sendRoomInfo, sendRoomUpdate } = require("./util");

module.exports.updateRound = ( io , roomId ) => {
    activeRooms[roomId].cround = parseInt(activeRooms[roomId].cround) + 1;
    sendRoomUpdate(io , { roomId , cround : activeRooms[roomId].cround } );
    sendRoomInfo( io , roomId );
}

module.exports.sendCanvasUpdate = (io , data) => {
    const { roomId , canvasPath } = data;
    activeRooms[roomId].canvasPath = canvasPath;
    sendRoomUpdate(io , { roomId , canvasPath });
}

const getRandomWords = (count) => {
    const randomWords = [];
    for( let i = 0 ; i < count ; i++ ){
        const randomWord = words[Math.ceil(Math.random() * (words.length - 1))];
        randomWords.push(randomWord);
    }
    return randomWords;
}

const getTurn = (room) => {
    if( !room.turns || room.turns.length === 0 ){
        room.turns = room.users.map( user => {
            return user._id
        })
    }
    const randomTurn = room.turns[Math.ceil(Math.random()*(room.turns.length - 1))];
    room.turns = room.turns.filter( turn => turn !== randomTurn );
    room.turn = randomTurn;
    return randomTurn;
}

module.exports.updateQuestion = (io , roomId) => {
    let updateQuestionDelay = 0;
    if( !activeRooms[roomId].question || activeRooms[roomId].question === 5 ){
        updateQuestionDelay = 3000;
        this.updateRound(io , roomId);
    }
    activeRooms[roomId].question = 1;
    const wordOptions = getRandomWords(3);
    const turn = getTurn( activeRooms[roomId] );
    setTimeout(() => {
        sendRoomUpdate( io , { roomId , turn , wordOptions });
    },updateQuestionDelay)
}

module.exports.selectWord = (io , data) => {
    const { roomId , word } = data;
    activeRooms[roomId].word = word;
    const turn = activeRooms[roomId].turn;
    sendMessage(messageIO.io , { roomId , userId : turn ,  type : 'drawing' })
    sendRoomUpdate(io , { roomId , drawing : true });   
}