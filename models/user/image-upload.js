const multer = require('multer');
const path = require('path');
const uploadPath = path.join(__dirname , '..' , '..' , 'uploads' , 'avatars/');

const diskStorage = multer.diskStorage({
    destination : function( req , file , callback ){
        return callback( null ,uploadPath);
    },
    filename : function( req , file , callback ){
        const dateString = Date.now().toString();
        return callback(null , file.fieldname + dateString + file.originalname );
    }
})

const multerOptions = {
    storage : diskStorage
}

const imageUpload = multer(multerOptions).single('avatar');

module.exports = imageUpload;