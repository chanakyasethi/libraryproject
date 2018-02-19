var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var bookSchema = new mongoose.Schema({
    name:{
          type: String
         },
    id:{    
        type:mongoose.Schema.Types.ObjectId
    },
    issuedon:{
        type: Date 
    }
});

var UserSchema = new mongoose.Schema({
    name:String,
    dob:String,
    gender:String,
    phone:String,
    username: String,
    password: String,
    booksissued: [bookSchema]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);