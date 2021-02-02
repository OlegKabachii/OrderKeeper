const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const keys = require('../config/keys')
const errorHandler = require('../utils/errorHandler')


module.exports.login = async (req,res) =>{
  //email password
   const candidate = await User.findOne({
    email: req.body.email
   })
    if(candidate){
        // check pass
        const passwordResult = bcrypt.compareSync(req.body.password, candidate.password)
        if(passwordResult){
            //gen token - pass correct
            const token = jwt.sign({
                email: candidate.email,
                userId: candidate._id
            }, keys.jwt, {expiresIn: 60*60})

            res.status(200).json({
                token: `Bearer ${token}`
            })
        }else{
            // pass is not correct
            res.status(401).json({
                message: 'password incorrect, try again'
            })
        }
    }else{
        // user not found
        res.status(404).json({
            message: 'User email not found'
        })
    }
}


module.exports.register = async (req,res)=> {
   //email password
   const candidate = await User.findOne({email: req.body.email})

    if(candidate){
        //user avalible - error
        res.status(409).json({
            message: 'Email is occupied'
        })
    }else{
        //create new user
        const salt = bcrypt.genSaltSync(10)
        const password = req.body.password
        const user = new User({
            email: req.body.email,
            password: bcrypt.hashSync(password, salt)
        })
        try{
            await user.save()
            res.status(201).json(user)
        }catch(error){
            // error handling
            errorHandler(res, error)
        }

    }
  }