const express = require('express');
const app = express();
const port = process.env.CRAYONS_PORT || 8000;
const cors = require('cors');
const http=require('http');

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