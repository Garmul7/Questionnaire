const express = require('express');
const jwt = require('jsonwebtoken');

const router=express.Router();
const BodyParser = require("body-parser");

const CONNECTION_URL = 'mongodb+srv://Garmul:stn369@myfirstdatabase.6s2c9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const DATABASE_NAME = "questionnaireStorage";

const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

const cors = require('cors')
router.use(cors())

router.use(BodyParser.json());
router.use(BodyParser.urlencoded({ extended: true }));

var database, collection;

const accountSchema = {
    type: "object",
    properties: {
        "_id": {type: "string"},
        "login": {type: "string", minLength: 3},
        "password": {type: "string", minLength: 5}
    },
    required: ["login", "password"]
}

function verifyAccount(body){
    const accountValid = validate(accountSchema, body);
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




    // router.get("/", (request, response) => {
    //     collection.find({}).toArray((error, result) => {
    //         if(error) {
    //             return response.status(500).send(error);
    //         }
    //         response.send(result);
    //     });
    // });

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
                    collection.insert(request.body, (error, result) => {
                        console.log(request.body);
                            if(error) {
                                return response.status(500).send(error);
                            }
                            console.log(result);
                            let payload = {subject: result._id};
                            let token = jwt.sign(payload, 'secretKey');
                            let login = request.body.login;
                            let userid = result._id;
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
                    if(passwordRequest != result.password){
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
