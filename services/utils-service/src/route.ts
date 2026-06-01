import express from 'express';
import cloudinary from 'cloudinary';

const router = express.Router();

router.post('/upload',async(req,res)=>{
    try{
        const {buffer,public_id} = req.body;
        if(public_id){
            await cloudinary.v2.uploader.destroy(public_id);
        }
        const cloud = await cloudinary.v2.uploader.upload(buffer);


    }
    catch(error :any){
        res.status(500).json({message : error.message})
    }
})

export default router;