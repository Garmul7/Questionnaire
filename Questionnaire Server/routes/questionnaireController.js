const express = require('express');
const router=express.Router();
const BodyParser = require("body-parser");

const CONNECTION_URL = 'mongodb+srv://Garmul:stn369@myfirstdatabase.6s2c9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const DATABASE_NAME = "questionnaireStorage";

const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

const cors = require('cors')
router.use(cors())

router.use(BodyParser.json({limit: '50mb'}));
router.use(BodyParser.urlencoded({ extended: true }));

const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const Ajv = require("ajv");
const ajv = new Ajv();

function verifyToken(req, res, next){
  if(!req.headers.authorization){
      return res.status(401).send('Unauthorized request')
  }
  
  let token=req.headers.authorization.split(' ')[1];
  if(token=="null"){
      return res.status(401).send('Unauthorized request');
  }
  let payload = jwt.verify(token, 'secretKey');
  if(!payload){
      return res.status(401).send('Unauthorized request')
  }


  req.userID=payload.subject
  next()
}
// schema for checking questions correctness
const questionSchema = {
    type: "object",
    properties: {
        imagePath: {type: ["string", "null"]},
        qDesc: {type: "string", maxLength: 48, minLength: 1},
        qAns: {type: "array", minItems:2, maxItems: 4}
    },
    required: ["qDesc", "qAns"]
};

// schema for checking questionnaire correctness
const questionnaireSchema = {
    type: "object",
    properties: {
        _id: {type: "string"},
        userid: {type: "string"},
        qTopic: {type: "string", maxLength: 48, minLength: 1},
        qQuestions: {type: "array"},
        votes: {type: "array"}
    },
    required: ["userid", "qTopic", "qQuestions", "votes"]
};
    
// verify the request questionnaire for post / put
function verifyQuestionnaire(body){   
    const questionnaireValid = ajv.validate(questionnaireSchema, body);
    if(questionnaireValid){
        for(const q of body.qQuestions){
            let questionsValid = ajv.validate(questionSchema, q);
            if(questionsValid){
                console.log('Questions Valid')
            }else{
                console.log('Questions Invalid');
                return false;
            }
        }
        console.log('Questionnaire Valid')
        return true;
    }else{
        console.log('Questionnaire Invalid'); 
        return false;
    }
}

// DATABASE / REQUESTS //////////////////////////////////////////////////////////////////
var database, collection;

    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("questionnaire");
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });



        router.post("/", verifyToken, (request, response) => {
            console.log(`Post request for a new questionnaire ${request.body}`);

            if(verifyQuestionnaire(request.body)){

                if(request.userID!=request.body.userid){ //make sure that the request is from the same user that is logged in
                    console.log("UserIds don't match");
                    return response.status(401).send("UserIds don't match");
                }

                request.body._id=null; //set _id to null so database creates it's own unique one

                collection.insert(request.body, (error, result) => {
                console.log(request.body);
                    if(error) {
                        console.log(error);
                        return response.status(500).send(error);
                    }
                    return response.status(200).send(request.body);
                });
            }else{return response.status(400).send('Invalid request')}
        });


        router.get("/", verifyToken, (request, response) => {
            console.log('get all request')
            console.log(request.userID)

            collection.find({userid: request.userID} , {projection:{qQuestions:0}}).toArray((error, result) => {
                if(error) {
                    console.log('error')
                    return response.status(500).send(error);
                }
                response.send(result);

            });

        });


        router.get("/:id", verifyToken, (request, response) => {

        collection.findOne({ "_id": new ObjectId(request.params.id) }, (error, result) => {
            if(error) {
                console.log('error');
                return response.status(500).send(error);
            }
            if(request.userID!=result.userid){
                return response.status(500).send('wrong user, cannot get');
            }
            console.log('get by id')

            response.send(result);
        });

        });

        router.put("/",verifyToken, (request, response) => {
        console.log(request.body);

        if(verifyQuestionnaire(request.body)){
            collection.findOneAndUpdate(
                {"_id" : new ObjectId(request.body._id), "userid": request.userID},
                {$set: {qTopic: request.body.qTopic, qQuestions: request.body.qQuestions, votes: request.body.votes}}, (error, result) => {
                if(error) {
                    console.log('error');
                    return response.status(500).send(error);
                }
                console.log('put already existing');
                console.log(request.body);
                response.send(result);
                });
            }else{response.status(400).send('Invalid request')}

        });

        router.delete("/:id", verifyToken, (request, response) =>{
            console.log(request.params.id);

            collection.deleteOne({"_id": new ObjectId(request.params.id), "userid": request.userID }, (error, result) => {
                if(error) {
                    console.log('error');
                    return response.status(500).send(error);
                }
                response.status(200).send(result);
            });

        });


module.exports=router;

