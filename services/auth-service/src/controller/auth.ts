import { Request, Response,NextFunction } from "express";
import {TryCatch} from "../utils/TryCatch.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sql } from "../utils/db.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import getBuffer from "../utils/buffer.js";
import axios from "axios";
import {forgotPasswordTemplate} from "../utils/template.js";
import { publishToTopic } from "../producer.js";
import { redisClient } from "../index.js";

export const register = TryCatch(async (req : Request , res : Response, next : NextFunction)=>{
    console.log("REGISTER HIT");
console.log(req.body);
     
    const {email,name,password,role,phone_number,bio} = req.body;
    if(!name || !email || !password || !role){
        throw new ErrorHandler("Please fill all detials",400);
    }
    const existingUser = await sql`Select user_id from users where email = ${email}`;
    if(existingUser.length > 0){
        throw new ErrorHandler("User with this email already exists",409);
    }

    const hashPassword = await bcrypt.hash(password,10);
    let registeredUser;
    if(role == "recruiter"){
        const [user] = await sql `Insert into users (name,email,password,phone_number,role) values ( ${name}, ${email}, ${hashPassword}, ${phone_number}, ${role}) returning 
        user_id,name,email,phone_number,role`
        registeredUser = user; 
    }
    else if(role == "jobseeker"){
        const file = req.file

        if(!file){
            throw new ErrorHandler("Resume file is required for jobseeker", 400);
        }
        const fileBuffer =  getBuffer(file);

        if(!fileBuffer || !fileBuffer.content){
            throw new ErrorHandler("Failed to geenrtae buffer",500);
        }

        const {data} = await axios.post(`${process.env.UPLOAD_SERVICE}/api/utils/upload`,{buffer: fileBuffer.content});

        const [user] = await sql `Insert into users (name,email,password,phone_number,role,bio,resume,resume_public_id) values 
        ( ${name}, ${email}, ${hashPassword}, ${phone_number}, ${role}, ${bio}, ${data.url}, ${data.public_id}) returning 
        user_id,name,email,phone_number,role,bio,resume,created_at`
        registeredUser = user;
    }
    else {
        throw new ErrorHandler("Invalid role",400);
    }

    if (!registeredUser) {
        throw new ErrorHandler("Registration failed",500);
    }
    console.log(req.body);
console.log("role =", role);

    const token = jwt.sign({id : registeredUser?.user_id}, process.env.JWT_SEC as string,{
        expiresIn : "15d",
    })

    res.json({
        message : "User registered",
        registeredUser,
        token
    })
})

export const loginUser = TryCatch(async(req,res,next)=>{

    const {email,password} = req.body;

    if(!email || !password){
        console.log("ErrorHandler:", ErrorHandler);
console.log("typeof:", typeof ErrorHandler);
        throw new ErrorHandler("Please fill all details",400);
    }
    
    const user = await sql `Select u.user_id,u.name,u.email,u.password,u.phone_number,u.role,u.bio,
    u.resume,u.profile_pic,u.subscription,ARRAY_AGG(s.name) FILTER (where s.name IS NOT NULL) as skills
    FROM users u LEFT JOIN user_skills us ON u.user_id = us.user_id 
    LEFT JOIN skills s ON us.skill_id = s.skill_id
    where u.email = ${email} GROUP BY u.user_id;
    `;

    if(user.length === 0){
        throw new ErrorHandler("Invalid credentials",400);
    }
    const userObject = user[0];

    const matchPassword = await bcrypt.compare(password,userObject.password);
    if(!matchPassword){
        throw new ErrorHandler("Invalid credentials",400);
    }
    userObject.skills = userObject.skills || [];

    delete userObject.password;

    const token = jwt.sign({id : userObject?.user_id}, process.env.JWT_SEC as string,{
        expiresIn : "15d",
    })

    res.json({
        message : "User logged In",
        userObject,
        token
    })

})
export const forgotPassword = TryCatch(async(req,res,next) =>{
    const {email} = req.body;

    if(!email){
        throw new ErrorHandler("email is required",400);
    }
    const users= await sql `Select user_id,email from users where email = ${email}`;

    if(users.length === 0){
        return res.json({
            message : "If that email exists, we have sent a reset link" 
        })
    }

    const user = users[0];

    const resetToken = jwt.sign({
        email : user.email,
        type : "reset",
    },
    process.env.JWT_SEC as string,
    {expiresIn : "15m"}
);
const resetLink = `${process.env.Frontend_Url}/reset/${resetToken}`

await redisClient.set('forgot: ${email}',resetToken,{
    EX : 900,
})

const message = {
    to :email,
    subject :"Reset your Password - hireheaven",
    html :forgotPasswordTemplate(resetLink),
}

publishToTopic("send-mail",message).catch((error)=>{
    console.log("failed to send message",error);
});

res.json({
    messsage : "If that email exists, we have sent a reset link",
})

})

export const  resetPassword = TryCatch(async(req, res, next)=>{
    const token = req.params.token as string;
    const {password} = req.body;

    let decoded : any;
    try{
        decoded = jwt.verify(token, process.env.JWT_SEC as string)
    } catch(error){
        throw new ErrorHandler("Invalid token type",400);
    }

    if(decoded.type !== "reset"){
        throw new ErrorHandler("Invalid token type", 400);
    }
    const email = decoded.email

    const storedToken = await redisClient.get(`forgot:${email}`);

    if(!storedToken || storedToken !== token){
        throw new ErrorHandler("User not found", 404);
    }

    const users = await sql `Select user_id from users where email = ${email}`;

    if(users.length === 0){
        throw new ErrorHandler("User not found",404);
    }
    const user = users[0];

    const hashPassword = await bcrypt.hash(password,10)

    await sql `Update users SET password = ${hashPassword} where user_id = ${user.user_id}`;

    await redisClient.del(`forgot:${email}`);

    res.json({message : "Password changed successfully"})
})
