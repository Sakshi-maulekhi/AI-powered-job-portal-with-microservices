import {Kafka} from 'kafkajs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
export const startSendMailConsumer = async()=>{
  try{
    const kafka = new Kafka({
      clientId : "mail-service",
      brokers : [process.env.Kafka_Broker || "localhost:9092"]
    });

    const consumer = kafka.consumer({groupId : "mail-servie-group"});

    await consumer.connect();

    const topicName = "send-mail";

   await consumer.subscribe({topic : topicName, fromBeginning : false});

  
   console.log(" ✔ Mail service consumer started, listening for sending mail");

   await consumer.run({
    eachMessage : async({topic,partition,message})=>{
      console.log("MESSAGE RECEIVED");
      try{
        const {to,subject,html} = JSON.parse(
          message.value?.toString() || "{}"
        );
        console.log("Mail consumer cwd:", process.cwd());
        console.log("Mail env values:", {
          EMAIL_USER: process.env.EMAIL_USER,
          EMAIL_PASS: process.env.EMAIL_PASS ? "***" : undefined,
          PASS: process.env.PASS ? "***" : undefined,
        });

        const mailUser = process.env.EMAIL_USER || "maulekhisakshi23@gmail.com";
        const mailPass = process.env.EMAIL_PASS || process.env.PASS;

        if (!mailUser || !mailPass) {
          console.log("Missing SMTP credentials:", { mailUser, mailPassDefined: Boolean(mailPass) });
        }

        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: mailUser,
            pass: mailPass,
          },
        });

        try {
          await transporter.verify();
          console.log("SMTP verified");
        } catch (err) {
          console.log("SMTP verify failed:", err);
          throw err;
        }

        // const info = await transporter.sendMail({
        //   from: mailUser,
        //   to,
        //   subject,
        //   html,
        // });
        const infoo = await transporter.sendMail({
  from: "Hireheaven <no-reply>",
  to,
  subject,
  html,
});


console.log(infoo);

        console.log(`Mail has been sent to ${to}`);
      }
      catch(error){
        console.log("Failed to send mail",error);
      }
      
    }
   })
  }
  catch(error){
    console.log("failed to start kafka consumer",error);

  }
}