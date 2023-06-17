//import model in userController.js file
const { response } = require('express');
const users = require('../Models/userSchema')

//import jsonwebtoken
const jwt = require('jsonwebtoken')

//define and export logic to resolve different http client request
exports.register = async (req,res)=>{
    //register logic
    console.log(req.body);
    //get data send by frond end
    const {username,acno,password} = req.body;
    if(!username||!acno||!password){
        res.status(406).json("All inputs are required")
    }
    //check user is an existing user
    try{
        const preuser = await users.findOne({acno})
        if(preuser){
            res.status(403).json("User already exists!")
        }else{
            //we have to add the user to db
            const newuser = new users({
                username,
                password,
                acno,
                balance:5000,
                transactions:[]
            })
            //to save new user in mongodb
            await newuser.save()
            res.status(200).json(newuser)
        }
    }catch(error){
        res.status(401).json(error)
    }
    
}

//login
exports.login = async (req,res)=>{
    //get req body
    const{acno,password}=req.body
    //check acno and password in db
    try{
        const preuser = await users.findOne({acno,password})
        //chack preuser or not
        if(preuser){
            //generate token using jwt
            const token = jwt.sign({
                loginAcno:acno
            },"supersecret12345")
            //send to client
           
            res.status(200).json({preuser,token})
        }else{
            res.status(404).json("invalid account number or password")
        }
    }
    catch(error){
        res.status(401).json(error)
    }
}

//getbalance
exports.getbalance = async (req,res)=>{
    //get acno from path parameter
    let acno = req.params.acno

    //get data of given acno
    try{
        //find acno from users collection
        const preuser = await users.findOne({acno})
        if(preuser){
            res.status(200).json(preuser.balance)
        }
        else{
            res.status(404).json("Invalid Account Number!!")
        }
    }
    catch(error){
        res.status(401).json(error)
    }

}

//transfer

exports.transfer = async (req,res)=>{
    console.log("Inside transfer logic");
    //logic
    //1. get body from req, creditacno , account , pswd
    const {creditAcno,creditAmount,pswd}= req.body
    //convert creditAmount to number
    let amt = Number(creditAmount)
    const {debitAcno}= req
    console.log(debitAcno);
    //2. check debit acno and pswd is available in mongodb
    try {
    const debitUserDetails = await users.findOne({acno:debitAcno,password:pswd})
    console.log(debitUserDetails);

    //3. get credit acno details from mongo db
    const creditUserDetails = await users.findOne({acno:creditAcno})
    console.log(creditUserDetails);

        if(debitAcno!=creditAcno){
            if(debitUserDetails && creditUserDetails){
                //check sufficient balance for available for debitUserDetails
                if(debitUserDetails.balance>=creditAmount){
                    //perform transfer
                    //debit credit amount from debitUserDetails 
                    debitUserDetails.balance -=amt
                    //add debit transaction to debitUserDetails
                    debitUserDetails.transactions.push({
                        transaction_type:"DEBIT",amount:creditAmount,fromAcno:debitAcno,toAcno:creditAcno
                    })
                    //save debitUserDetails in mongodb
                    debitUserDetails.save()
                    //credit creditAmount to creditUserDetails
                    creditUserDetails.balance+=amt
                    //add debit transaction to debitUserDetails
                    debitUserDetails.transactions.push({
                        transaction_type:"CREDIT",amount:creditAmount,fromAcno:debitAcno,toAcno:creditAcno
                    })
                    //save creditUserDetails in mongodb
                    creditUserDetails.save()
                    res.status(200).json("Fund Transfer Successfully completed")
                }else{
                    res.status(406).json("insufficient balance")
                }
        
            }
            else{
                res.status(406).json("invalid credit / debit details!!!")
            }
            
        }else{
            res.status(406).json("Operation Denied Self transaction are not allowed")
        }

    
    }
    catch(error){
        res.status(401).json(error)
    }
    
}

//getTransaction

exports.getTransaction = async (req,res)=>{
    //get acno from req.debitAcno
    let acno = req.debitAcno

    //check acno in mongodb
    try{
        const preuser = await users.findOne({acno})
        res.status(200).json(preuser.transactions)
    }
    catch(error){
        res.status(401).json("Invalid Account Number")
    }
}

//delete my account

exports.deleteMyAcno = async (req,res)=>{
    //1 get acno from req
    let acno = req.debitAcno

    //remove acno frm db
    try{
        const removeitem = await users.deleteOne({acno})
        res.status(200).json("removed successfully")
    }
    catch(error){
        res.status(401).json(error)
    }
}