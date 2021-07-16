const { messageIO } = require("../../Message Server/data");
const { sendMessage } = require("../../Message Server/util/util");
const { activeRooms, userToSocket , words , gameIO } = require("../data");
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
    if( activeRooms[roomId].timerInterval ){
        clearInterval(activeRooms[roomId].timerInterval)
    }
    for( const userId in activeRooms[roomId].scores ){
        activeRooms[roomId].scores[userId].question = 0;
    }
    let updateQuestionDelay = 0;
    if( !activeRooms[roomId].question || activeRooms[roomId].question === 5 ){
        if( activeRooms[roomId].question === 5 ){
            updateQuestionDelay = 3000;
            this.updateRound(io , roomId)
        }
        activeRooms[roomId].question = 0;
    }
    activeRooms[roomId].question += 1;
    const wordOptions = getRandomWords(3);
    const turn = getTurn( activeRooms[roomId] );
    setTimeout(() => {
        sendRoomUpdate( io , { roomId , turn , wordOptions , scores : activeRooms[roomId].scores });
    },updateQuestionDelay);
}

const getHint = (interval , drawTime , word) => {
    const length = word.length;
    let showWordLength = Math.floor(((drawTime - interval)*length)/drawTime);
    let hint = '';
    for( let i = 0 ; i < length ; i++)
        hint+='_'
    for( let i = 0 ; i < length && showWordLength > 0 ; i+=2 && showWordLength-- ){
        hint = hint.split('');
        hint[i] = word[i];
        hint = hint.join('');
    }
    return hint;
}

module.exports.selectWord = (io , data) => {
    const { roomId , word } = data;
    activeRooms[roomId].word = word;
    const turn = activeRooms[roomId].turn;
    sendMessage(messageIO.io , { roomId , userId : turn ,  type : 'drawing' });
    sendRoomUpdate(io , { roomId , drawing : true });   
    let questionInterval = parseInt(activeRooms[roomId].drawingTime);
    activeRooms[roomId].timerInterval = setInterval(() => {
        questionInterval--;
        const hint = getHint( questionInterval , parseInt(activeRooms[roomId].drawingTime) , word );
        io.to(`game${roomId}`).emit('timer-update', {timer : questionInterval , hint  });
        if( questionInterval === 0 ){
            clearInterval(activeRooms[roomId].timerInterval);
            io.to(`game${roomId}`).emit('show-scores' , { word : word , scores : activeRooms[roomId].scores  });
            setTimeout(() => {
                this.updateQuestion(io , roomId);
            },3000);
        }
    },1000)
}

module.exports.checkMessage = (data) => {
    let {roomId , text , userId} = data;
    text = text.trim();
    const isRight =  text === activeRooms[roomId].word;
    if( isRight && activeRooms[roomId].scores[userId].question === 0 ){
        activeRooms[roomId].scores[userId].question += 100;
        activeRooms[roomId].scores[userId].overall += 100;
        sendRoomUpdate(gameIO.io , { roomId , scores : activeRooms[roomId].scores });
    }
    return isRight;
}

