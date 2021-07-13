const express = require('express');
const app = express();
const port = process.env.CRAYONS_PORT || 8000;
const cors = require('cors');
const http=require('http');

const gameServer = http.Server(app);
const gameServerSocket = require('./config/Game Server/gameServer').createGameServer(gameServer);
gameServer.listen(process.env.CRAYONS_GAME_PORT || 9000);

const usersServer = http.Server(app);
const usersServerSocket = require('./config/usersServer/usersServer').createUsersServer(usersServer);
usersServer.listen(process.env.CRAYONS_USERS_PORT || 5000);

const messageServer = http.Server(app);
const messageServerSocket = require('./config/Message Server/index').createMessageServer(messageServer)
messageServer.listen(process.env.CRAYONS_USERS_PORT || 2000);

const db = require('./config/mongoose');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended : true }));

app.use('/',require('./routes/'));


app.listen( port , ( err ) => {
    if( err ){
        console.log('Error in starting server')
    }else{
        console.log('Server up and running on port',port);
    }
} )