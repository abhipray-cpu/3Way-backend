const express = require('express')

const router = express.Router();
const userController = require('../controller/user');
const user = require('../model/user');
router.post('/login',userController.login)
router.post('/signup',userController.signup)
router.get('/home/:userName',userController.userChats)
router.get('/transporters',userController.getTransporters)
router.get('/manufacturers',userController.getManufacturer)
router.get('/getChat/:id',userController.getChat)
router.get('/change-status/:id',userController.changeStatus)
module.exports = router