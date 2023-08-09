const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    contact:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    customer:{
        type:String,
        enum:['manufacturer','transporter'],
        required:true
    },
    token: { type: String }
})

module.exports = mongoose.model('user',UserSchema)