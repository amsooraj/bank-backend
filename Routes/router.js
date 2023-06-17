//import espress
const express = require('express');

//import middleware
const middleware = require('../Middleware/routerspecific')

//create routes using express.router()
const router = new express.Router();

//import controller 
const userController = require('../controllers/userController')

//define the routes to resolve http requests

//for register //post req
router.post('/employee/register',userController.register)

//for log in
router.post('/employee/login',userController.login)

//getbalance rqst
router.get('/user/balance/:acno',middleware.logMiddleware,userController.getbalance)

//fund transfer
router.post('/user/transfer',middleware.logMiddleware,userController.transfer)

//ministatement
router.get('/user/ministatement',middleware.logMiddleware,userController.getTransaction)

//delete account
router.delete('/user/remove',middleware.logMiddleware,userController.deleteMyAcno)

//export router to use router in a another file we have to export router
module.exports=router