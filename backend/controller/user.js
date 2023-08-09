const User = require('../model/user')
const Order = require('../model/orders')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
exports.login = async(req,res,next)=>{
    let username = req.body.data.username;
  let password = req.body.data.password;

  //checking if username exists
  let user = await User.find({userName:username})
  if(user.length==0){
    return res.status(400).json({msg:'No user found'})
  }
  user = user[0]
  let match = await bcrypt.compare(password, user.password)
  if(match){
    //here we can also maintain a toke using json web token if required
    const token = jwt.sign({ username }, 'some-large-secret-key-when-in-production', { expiresIn: '2400h' });
    return res.status(200).json({msg:'user Validated',token:token,user:username,role:user.customer})
  }
  else{
    return res.status(400).json({msg:'Wrong password'})
  }
  //checking if password matched

}

exports.signup = async(req,res,next)=>{
  // for production we also need to add validation here to ensure no data replication
  let username = req.body.data.username;
  let email = req.body.data.email;
  let password = req.body.data.password;
  let contact = req.body.data.contact;
  let role = req.body.data.role;
  try{
//validatin user data
let user1 = await User.find({userName:username})
if(user1.length>0){
    res.status(422)
  return res.json({msg:'This username exists'})
}
let user2 = await User.find({email:email})
if(user2.length>0){
    res.status(422)
  return res.json({msg:'This email exists'})
}
let user3 = await User.find({contact:contact})
if(user3.length>0){
    res.status(422)
  return res.json({msg:'This contact exists'})
}

    //creating user
    const hashedPassword = await bcrypt.hash(password, 13)
  let user = new User({
    userName:username,
    email:email,
    contact:contact,
    password:hashedPassword,
    customer:role
  })
  let response = await user.save()
  res.status(200)
  return res.json({msg:'User created successfully'})
  }
  catch(err){
    console.log(err)
    res.status(501)
 return res.json({msg:'Something went wrong at our end'})
  }
}

//this will get all the chats
exports.userChats = async(req,res,next)=>{
    try{
        let userName = req.params.userName;
    let chats = await Order.find({
        $or:[
            {manufacturer:userName},
            {transporter:userName}
        ]
    }).sort({ createdAt: 1 })
    if(chats.length==0){
      return res.status(200).json({msg:'No chats found!!'})
    }
   return res.status(200).json({msg:'Chats found',chat:chats})
    }
    catch(err){
        return res.status(501).json({msg:'Server Side error'})
    }
}
exports.getTransporters = async(req,res,next)=>{
    try{
        let transporters = await User.find({customer:"transporter"}).select({userName:1,_id:-1})
        if(transporters.length==0){
            return res.status(200).json({msg:'No transporters!!',transporters:[]})
        }
        else{
            return res.status(200).json({msg:'Transporters found!!',transporters:transporters})
        }
    }
    catch(err){
        console.log(err)
        return res.status(501).json({msg:'Server Side error'})
    }
}
exports.getManufacturer = async(req,res,next)=>{
    try{
        let transporters = await User.find({customer:"manufacturer"}).select({userName:1,_id:-1})
        if(transporters.length==0){
            return res.status(200).json({msg:'No manufacturers!!',transporters:[]})
        }
        else{
            return res.status(200).json({msg:'Manufacturers found!!',transporters:transporters})
        }
    }
    catch(err){
        console.log(err)
        return res.status(501).json({msg:'Server Side error'})
    }
}

exports.getChat = async (req,res,next)=>{
    try{
      let order = await Order.find({_id:req.params.id})
      if(order.length>0){
        return res.status(200).json({msg:'Chat found',chat:order[0]})
      }
      else{ 
          return res.status(404).json({msg:'No chat found!!'})
      }

    }
    catch(err){
        return res.status(501).json({msg:'Server side error'})
    }
},
exports.changeStatus = async(req,res,next)=>{
    try{
        await Order.updateOne({_id:req.params.id},{
            $set:{
                status:'confirmed'
            }
        })
        return res.status(200).json({msg:'Status changed'})
        
    }
    catch(err){
        console.log(err)
        return res.status(501).json({msg:'Server side error'})
    }
}