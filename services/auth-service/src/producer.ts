import {Kafka, Producer, Admin} from 'Kafkajs';
import dotenv from 'dotenv';

dotenv.config();

let producer : Producer;
let admin :Admin;

export const connectKafka = async()=>{
    try{
        const kafka = new Kafka({
            clientId : "mail-service",
            brokers : [process.env.Kafka_Brokers || "localhost:9092"]
        })
        admin = kafka.admin();
        admin.connect();

        const topics = await  admin.listTopics();

        if(!topics.includes("send-mail")){
            await admin.createTopics({
                topics : [
                    {
                        topic : "send-mail",
                        numPartitions :1,
                        replicationFactor : 1,

                    }
                ]

            })
            console.log("✔ topic send-mail created");
        }
        await admin.disconnect();

        producer = kafka.producer();
        await producer.connect();

        console.log("✔ connected to kafka producer");
    }
    catch(error){
        console.log("failed to connect to kafka");

    }
}

export const publishToTopic = async (topic:string, message : any)=>{
    if(!producer){
        console.log("kafka producer is not initialised");
        return;
    }
    try{
        await producer.send({
            topic : topic,
            messages : [
                {
                    value : JSON.stringify(message),
                }
            ]
        });

    }
    catch(error){
        console.log("Failed to publish message to kafka ",error);
    }
}

export const disconnectKafka = async()=>{
    if(producer){
        producer.disconnect();
    }

}
