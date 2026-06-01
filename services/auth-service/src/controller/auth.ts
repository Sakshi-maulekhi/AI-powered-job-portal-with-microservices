import { Request, Response,NextFunction } from "express";
import {TryCatch} from "../utils/TryCatch.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sql } from "../utils/db.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
        user_id,name,email,phoneNumber,role`
        registeredUser = user; 
    }
    else if(role == "jobseeker"){
        const file = req.file
        const [user] = await sql `Insert into users (name,email,password,phone_number,role) values ( ${name}, ${email}, ${hashPassword}, ${phone_number}, ${role}) returning 
        user_id,name,email,phone_number,role`
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
