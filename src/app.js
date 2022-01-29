import express from 'express';
import cors from 'cors';
import joi from 'joi';
//dotenv

const app = express();
app.use(express.json());
app.use(cors());

const nameSchema = joi.object({
    name: joi.string().required()
})

app.post('/participants', (req, res) => {
    const validation = nameSchema.validate(req.body);
    if(validation.error){
        res.status(422).send(validation.error.details[0].message);
        return;
    }

    res.sendStatus(201)

});


app.get('/participants', (req, res) => {

});


app.post('/messages', (req, res) => {

});


app.get('/messages', (req, res) => {

});


app.post('/status', (req, res) => {

});


app.listen(5000);