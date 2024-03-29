const mongoose=require('mongoose');

mongoose.connect(`mongodb://localhost/crayons_development`);

const db=mongoose.connection;

db.on('error',console.error.bind(console,"Error in connecting to MongoDB"));

db.once('open',function(){
    console.log("Connected To DB :: MongoDB");
});

module.exports=db;