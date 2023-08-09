const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    from:{
        type:String,
        required:true
    },
    to:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    //this is the pickup address for the transporter
    pickup:{
        type:String,
        required:true
    },
    manufacturer:{
        type:String,
      required:true
    },
    transporter:{
      type:String,
      required:true
    },
    status:{
        type:String,
        enum:['pending','confirmed'],
        default:'pending'
    },
    chats:[
        {
            msg:String,
            sender:String,
            receiver:String
        }
    ]
})

module.exports = mongoose.model('order',orderSchema)