const express = require('express');
const jwt = require('jsonwebtoken');

const router=express.Router();
const BodyParser = require("body-parser");

const CONNECTION_URL = 'mongodb+srv://Garmul:stn369@myfirstdatabase.6s2c9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const DATABASE_NAME = "questionnaireStorage";

const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

const cors = require('cors')
const crypto = require('crypto')

router.use(cors())

router.use(BodyParser.json());
router.use(BodyParser.urlencoded({ extended: true }));

var database, collection;

const Ajv = require("ajv");
const ajv = new Ajv();

const accountSchema = {
    type: "object",
    properties: {
        "_id": {type: "string"},
        "login": {type: "string", minLength: 3, maxLength: 24},
        "password": {type: "string", minLength: 5, maxLength: 24}
    },
    required: ["login", "password"]
}

function verifyAccount(body){
    const accountValid = ajv.validate(accountSchema, body);
    if(accountValid){
        console.log('Account Valid')
        return true;
    }else{console.log('Account invalid'); return false;}
}



    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("account");
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });



    router.post("/register", (request, response) => {       
        console.log('register')
        console.log(request.body)

        if(verifyAccount(request.body)){
            collection.findOne({ "login": request.body.login }, (error, result) => {
                if(error) {
                    return response.status(500).send(error);
                }
                if(result){ // if we find that login already among the users
                    console.log(result)
                    response.status(409).send("account with this login already exists");
                    return
                    
                }else{

                    request.body._id = null; // make sure the _id is null so database creates a new unique one
                    request.body.salt = crypto.randomBytes(16).toString('hex');
                    request.body.hash = crypto.pbkdf2Sync(request.body.password, request.body.salt, 1000, 64, 'sha512').toString('hex');
                    delete request.body.password

                    collection.insert(request.body, (error, result) => {
                        console.log(request.body);
                            if(error) {
                                return response.status(500).send(error);
                            }
                            console.log(result);
                            let payload = {subject: request.body._id};
                            let token = jwt.sign(payload, 'secretKey');
                            let login = request.body.login;
                            let userid = request.body._id;
                            console.log('user registered')
                            response.status(200).send({token, login, userid});
                        });
                }
            });
    }else{return response.status(400).send('Invalid request')}
    });


    router.post("/login", (request, response)=> {
        console.log('login')
        if(verifyAccount(request.body)){
            var passwordRequest=request.body.password;
            
            collection.findOne({ "login": request.body.login }, (error, result) => {
                if(error) {
                    return response.status(500).send(error);
                }

                if(!result){
                    return response.status(401).send("Invalid login");
                }else{
                    var hash = crypto.pbkdf2Sync(passwordRequest, result.salt, 1000, 64, 'sha512').toString('hex');
                    if(hash != result.hash){
                        return response.status(401).send("Invalid password");
                    }else{
                        let payload = {subject: result._id};
                        let token = jwt.sign(payload, 'secretKey');
                        let login = request.body.login;
                        let userid = result._id;
                        console.log('User logged in')
                        return response.status(200).send({token, login, userid});
                    }
                }
            });
        }else{return response.status(400).send('Invalid request')}
    });

module.exports=router;
