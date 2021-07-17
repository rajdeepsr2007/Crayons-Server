const { messageIO } = require("../../Message Server/data");
const { sendMessage } = require("../../Message Server/util/util");
const { activeRooms, userToSocket , words , gameIO, startTimes } = require("../data");
const { sendRoomInfo, sendRoomUpdate , cleanUpGame } = require("./util");


module.exports.updateRound = ( io , roomId ) => {
    const room = activeRooms[roomId];
    if( room.cround == room.rounds  ){
        io.to(`game${roomId}`).emit('game-end');
        cleanUpGame(roomId);
        return true;
    }
    room.cround = parseInt(room.cround) + 1;
    sendRoomUpdate(io , { roomId , cround : room.cround } );
    sendRoomInfo( io , roomId );
    return false;
}

module.exports.sendCanvasUpdate = (io , data) => {
    const { roomId , canvasPath } = data;
    activeRooms[roomId].canvasPath = canvasPath;
    sendRoomUpdate(io , { roomId , canvasPath });
}

const getRandomWords = (count , roomId) => {
    const randomWords = [];
    const customWords = activeRooms[roomId].words;
    let searchLength = words.length;
    if( customWords && customWords.length > 0 ){
        searchLength += customWords.length;
    }
    for( let i = 0 ; i < count ; i++ ){
        const wordIndex = Math.ceil(Math.random() * ( searchLength - 1));
        const randomWord = wordIndex > words.length - 1 ? 
                           customWords[wordIndex%words.length] : 
                           words[wordIndex];
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
    const room = activeRooms[roomId];
    if( room.timerInterval ){
        clearInterval(room.timerInterval)
    }
    for( const userId in room.scores ){
        room.scores[userId].question = 0;
    }
    let updateQuestionDelay = 0;
    if( !room.question || room.question === 5 ){
        if( room.question === 5 ){
            updateQuestionDelay = 5000;
            const isEnd = this.updateRound(io , roomId);
            if( isEnd )
                return;
        }
        room.question = 0;
    }
    room.question += 1;
    const wordOptions = getRandomWords(3 , roomId);
    const turn = getTurn( room );
    setTimeout(() => {
        sendRoomUpdate( io , { roomId , turn , wordOptions , scores : room.scores });
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
    const room = activeRooms[roomId];
    room.word = word;
    const turn = room.turn;
    sendMessage(messageIO.io , { roomId , userId : turn ,  type : 'drawing' });
    sendRoomUpdate(io , { roomId , drawing : true });   
    let questionInterval = parseInt(room.drawingTime);
    startTimes[roomId] = new Date();
    room.timerInterval = setInterval(() => {
        questionInterval--;
        const hint = getHint( questionInterval , parseInt(room.drawingTime) , word );
        io.to(`game${roomId}`).emit('timer-update', {timer : questionInterval , hint  });
        if( questionInterval === 0 ){
            clearInterval(room.timerInterval);
            io.to(`game${roomId}`).emit('show-scores' , { word : word , scores : room.scores  });
            setTimeout(() => {
                this.updateQuestion(io , roomId);
            },5000);
        }
    },1000)
}

const getScore = ( roomId ) => {
    const room = activeRooms[roomId];
    const drawingTime = parseInt(room.drawingTime);
    const timeTaken = (new Date() - startTimes[roomId])/1000;
    const score = Math.ceil(((drawingTime - timeTaken)/(drawingTime - 20 )) * 250);
    return score > 250 ? 250 : score;
}

module.exports.checkMessage = (data) => {
    let {roomId , text , userId} = data;
    const room = activeRooms[roomId];
    const isRight =  text.trim() === room.word;
    if( isRight && activeRooms[roomId].scores[userId].question === 0 ){
        const incScore = getScore( roomId );
        room.scores[userId].question += incScore;
        room.scores[userId].overall += incScore;
        sendRoomUpdate(gameIO.io , { roomId , scores : room.scores });
    }
    return isRight;
}



