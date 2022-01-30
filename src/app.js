import dotenv from 'dotenv';
import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import joi from 'joi';
import dayjs from 'dayjs';

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

const nameSchema = joi.object({
    name: joi.string().required()
})

const messageSchema = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type: joi.valid('message', 'private_message').required()
})


app.post('/participants', async (req, res) => {
    const validation = nameSchema.validate(req.body);
    if(validation.error){
        res.status(422).send(validation.error.details[0].message);
        return;
    }

    try {
        const mongoClient = new MongoClient(process.env.MONGO_URI);
        await mongoClient.connect();

        const collection = mongoClient.db("batepapouol").collection("participants");

        if(await collection.findOne({ name: req.body.name })){
            res.status(409).send("Participante já existe");
            mongoClient.close();
            return
        }

        const participantData = {
            name: req.body.name,
            lastStatus: Date.now()
        }

        const participant = await collection.insertOne(participantData);
        res.sendStatus(201);
        mongoClient.close();
    }
    catch(error) {
        res.status(500).send(error);
    }
});


app.get('/participants', async (req, res) => {
    try {
        const mongoClient = new MongoClient(process.env.MONGO_URI);
        await mongoClient.connect();

        const participants = await mongoClient.db("batepapouol").collection("participants").find({}).toArray();

        res.send(participants);
        mongoClient.close();
    }
    catch(error) {
        res.status(500).send(error);
    }
});


app.post('/messages', async (req, res) => {
    try {
        const mongoClient = new MongoClient(process.env.MONGO_URI);
        await mongoClient.connect();

        if(!await mongoClient.db("batepapouol").collection("participants").findOne({ name: req.headers.user })){
            res.sendStatus(422);
            mongoClient.close();
            return
        }

        const validation = messageSchema.validate(req.body, { abortEarly: false });
        if(validation.error){
            res.status(422).send(validation.error.details.map(error => error.message));
            mongoClient.close();
            return;
        }

        const message = { ...req.body, from: req.headers.user, time: dayjs().format('HH:mm:ss') };
        await mongoClient.db("batepapouol").collection("messages").insertOne(message);
        
        res.sendStatus(201);
        mongoClient.close()
    }
    catch(error) {
        res.status(500).send(error)
    }
});


app.get('/messages', (req, res) => {

});


app.post('/status', (req, res) => {

});


app.listen(5000);