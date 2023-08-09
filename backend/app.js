const express = require('express')
require('dotenv').config();
const socketIo = require('socket.io');
const path = require('path')
const Order = require('./model/orders.js')
const bodyParser = require('body-parser')

const MONGO_URI = process.env.MONGO_URI;

const mongoose = require('mongoose')
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(http, {
    cors: {
      origins: ['http://localhost:8080']
    }
  });
app.use(cors({
    origin: 'http://localhost:8080'
}));
const router = require('./routes/router');
const { mkdirSync } = require('fs');
app.use(bodyParser.json());
app.use(router)
const userSocketMap = {};
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    socket.on('setUsername', (username) => {
        userSocketMap[username] = socket.id;
        console.log(`${username} connected with socket ID: ${socket.id}`);
      });
    //here will filter based on used name
    socket.on('my message', async (msg) => {
        //sending message to transporter only
        let quantity = msg.quantity;
        let address = msg.address;
        let from = msg.from;
        let to = msg.to;
        let transporter = msg.transporter;
        let manufacturer = msg.manufacturer;
        // creating a document and sending message
        let order = new Order({
            from:from,
            to:to,
            quantity:quantity,
            pickup:address,
            manufacturer:manufacturer,
            transporter:transporter,
            status:'pending',
            chats:[{
                msg:`${manufacturer} placed and order for ${quantity} from ${from} ot ${to} and pickup address is ${address}`,
                sender:manufacturer,
                receiver:transporter
            }]
        })
       await order.save()
       const targetSocketId = userSocketMap[transporter];
       if (targetSocketId) {
        io.to(targetSocketId).emit('message', msg);
      } else {
        console.log(`User ${targetSocketId} not found.`);
      }
      });
      //this for updaing new messages
      socket.on('new msg', async(msg)=>{
        //updating doc
        let order = await Order.find({_id:msg.id})
        order = order[0]
        let chats = order.chats
        chats.push({
            msg:msg.msg,
            sender:msg.sender,
            receiver:msg.receiver
        })
     await Order.updateOne({_id:msg.id},{
        $set:{
            chats:chats
        }
    })
    //forwarding message to user
    const targetSocketId = userSocketMap[msg.receiver];
    if (targetSocketId) {
     io.to(targetSocketId).emit('new', msg);
   } else {
     console.log(`User ${targetSocketId} not found.`);
   }
    
      })
  });
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(user => {
        console.log("Connected successfully!!");
        http.listen(4000);
    })
    .catch(err=>{
        console.log(err)
    })