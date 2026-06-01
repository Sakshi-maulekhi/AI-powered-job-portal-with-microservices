import express from 'express';
import authRoutes from "./routes/auth.js";

const app = express();
app.use(express.json());
app.use("/api/auth",authRoutes);
app.get("/test", (req,res)=>{
   res.send("OK");
});

export default app;