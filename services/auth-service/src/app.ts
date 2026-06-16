import express from 'express';
import authRoutes from "./routes/auth.js";
import {connectKafka} from "./producer.js";

const app = express();

await connectKafka();
app.use(express.json());

app.use("/api/auth",authRoutes);

app.get("/test", (req,res)=>{
   res.send("OK");
});

export default app;