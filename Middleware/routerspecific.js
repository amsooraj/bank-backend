//router specific middleware
const jwt = require('jsonwebtoken')

//define the logic for checking user loginned or not
const logMiddleware = (req,res,next)=>{
    console.log("Router specific middleware");
    //get token
    const token = req.headers['access-token']
    try{
        
    //verify the token
    const {loginAcno} = jwt.verify(token,"supersecret12345")
    console.log(loginAcno);
    //pass loginAcno to req
    req.debitAcno = loginAcno
    //to process user request
    next()
    }
    catch{
        res.status(401).json("please Log in")
    }
}

module.exports={
    logMiddleware
}