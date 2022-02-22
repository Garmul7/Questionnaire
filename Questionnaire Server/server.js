// sockets
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();



// database
const fetch = require("node-fetch")

const cors = require('cors')

const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const { get } = require("express/lib/response");
const res = require("express/lib/response");

const CONNECTION_URL = 'mongodb+srv://Garmul:stn369@myfirstdatabase.6s2c9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const DATABASE_NAME = "questionnaireStorage";


app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(cors())
// new


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



app.post("/questionnaire", (request, response) => {

    console.log(`request for ${request}`)
    collection.insert(request.body, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result.result);
    });

});

app.get("/questionnaire", (request, response) => {
    collection.find({}).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});


app.get("/questionnaire/:id", (request, response) => {
  collection.findOne({ "_id": new ObjectId(request.params.id) }, (error, result) => {
      if(error) {
          return response.status(500).send(error);
      }
      response.send(result);
  });
});

app.put("/questionnaire", (request, response) => {
  console.log(request.body._id)
  collection.findOneAndUpdate(
    {"_id" : new ObjectId(request.body._id)},
    {$set: {qTopic: request.body.qTopic, qQuestions: request.body.qQuestions, votes: request.body.votes}}, (error, result) => {
      if(error) {
        console.log('error');
        return response.status(500).send(error);
      }
      response.send(result);
    });

})


//////////////////////////////////////////////////////////////////////////////////////////////


// SOCKETS ROOMS AND VORTING /////////////////////////////////////////////////////////////////

const ActiveRooms=[];
const Voters=[];


// Assign the socket with roomid and remember them in active rooms
function hostRoom(roomid, questionnaireID, currentQuestion, answers, users) {
  const room = {roomid, questionnaireID, currentQuestion, answers, users};
  ActiveRooms.push(room);
  return room;
}

function joinRoom(voterid,  roomid) {
  Voters[voterid]=roomid;
}

function deleteIfEmpty(roomid){
  console.log('deleteifEmpty ///////////////////')
  //let room = ActiveRooms.find(room => room.roomid === roomid)
  const index = ActiveRooms.findIndex(room => room.roomid === roomid);

  if(index!=-1)
  if(ActiveRooms[index].users.length==0){
    ActiveRooms.splice(index, 1);
    console.log('room is empty, deleting')
  }
  console.log(ActiveRooms)
}


const server = http.createServer(app);
const io = socketio(server);

// Run when client connects
io.on('connection', socket => {

  // HOST PART //////////////////////////////////////////////////////////////////////////////////

    // When server recieves a hostRoom command, create a new room that will host a questionnaire
  socket.on('hostRoom', (questionnaireID, votes) => {
    // if the host was already hosting without disconnecting but still decides to rehost, delete previous room
    if(Voters[socket.id]){
      const index = ActiveRooms.findIndex(room => room.roomid === Voters[socket.id]);
      ActiveRooms.splice(index, 1);
    }
      
    // Generate new 6 digit roomID that is unique
    newRoomid = 0;
    while(true){
        let flag=0;
        newRoomid = Math.floor(100000 + Math.random() * 900000);
        for(iroom in ActiveRooms){
            if(iroom.roomid == newRoomid){
                flag+=1;
            }
        }
        if(flag==0){
            break;
        }
    }

    const room = hostRoom(newRoomid, questionnaireID, 0, votes, []);
    console.log(room)
    joinRoom(socket.id, newRoomid)

    socket.join(room.roomid);

    console.log(`socket ${socket.id} hosted room ${room.roomid} with questionnaire ${room.questionnaireID}`);

    socket.emit('generatedRoom', room.roomid, 0, (votes));
    console.log(`Rooms currently runnig: ${ActiveRooms.length}`);
    console.log(ActiveRooms)
  

  });


  // When host refreshes room he gets all the information again from the server
  socket.on('getHostedRoom', (roomid) => {
    console.log('host reloaded')
    const hostedRoom = ActiveRooms.find(room => room.roomid === roomid);
    if(hostedRoom){
      hostedRoom.users.push(socket.id)
      joinRoom(socket.id, roomid)
      console.log(hostedRoom)
      socket.join(roomid);
      socket.emit('generatedRoom', roomid, hostedRoom.currentQuestion, hostedRoom.answers);
    } else{ socket.emit('error', 'Room not found')}
  });

  // Change question for room and give the current question to all voters
  socket.on('changeQuestion', (currentQuestion, roomid) => {
    console.log('recieved change question')
    const hostedRoom = ActiveRooms.find(room => room.roomid === roomid);
    if(hostedRoom) {
      hostedRoom.currentQuestion= currentQuestion;
      let possibleAns=hostedRoom.answers[currentQuestion].length;
      console.log('changed question, currentQ, possibleAns')
      console.log(currentQuestion, possibleAns)
      io.to(roomid).emit('currentQuestion', currentQuestion, possibleAns); // HERE IO EMIT RETARD
    } else {socket.emit('error', 'Room not found')}
  });


  // VOTER PART //////////////////////////////////////////////////////////////////////////////////

  // Join a hosted room
  socket.on('joinRoom', (joinroomid) => {
    const hostedRoom = ActiveRooms.find(room => room.roomid === joinroomid);
    if(hostedRoom){
      socket.join(hostedRoom.roomid);
      hostedRoom.users.push(socket.id);
      joinRoom(socket.id, hostedRoom.roomid);
      console.log(`user ${socket.id} connected to ${hostedRoom.roomid} that is hosting ${hostedRoom.questionnaireID} `);
      console.log(`curret users: ${Voters}`);
      console.log(Voters)
      
      cq = hostedRoom.currentQuestion

      socket.emit('currentQuestion', cq , hostedRoom.answers[cq].length); 
    } else {socket.emit('error', 'Room not found')}
  });

  //send vote 0 1 2 3 ((a b c d)) and send votes to the room 
  socket.on('sendVote', (vote) => {
    let voterroom=Voters[socket.id];
    index = ActiveRooms.findIndex(room => room.roomid === voterroom);
    if(vote != 5){
      if (index !== -1 ) {
        currentQuestion=ActiveRooms[index].currentQuestion;
        ActiveRooms[index].answers[currentQuestion][vote]+=1;
        console.log(`Recieved vote ${vote} for question ${currentQuestion}, roomid ${voterroom}`)
        console.log(`Answers: ${ActiveRooms[index].answers[currentQuestion]}`);
        io.to(voterroom).emit('vote', (ActiveRooms[index].answers[currentQuestion]));
      }else {socket.emit('error', 'Room not found')}
    }else{socket.emit('error', 'Recieved wrong vote request')}
  });

  // On disconnect, delete users, check if room is empty, if it is, delete room
  socket.on('disconnect', () => {
    //delete the voter information
    console.log('dissconnect')
    if(Voters[socket.id]){
      let voterroom=Voters[socket.id];
      const index = ActiveRooms.findIndex(room => room.roomid === voterroom);
      if(index!=-1){
        console.log(`room found on dc`)
        console.log(ActiveRooms[index])
          const index2 = ActiveRooms[index].users.findIndex(user => user === socket.id);
          if(index2!=-1){
          ActiveRooms[index].users.splice(index2,1)
          console.log(`room after dc`)
          console.log(ActiveRooms[index])
          // delay the deletion by a few seconds, because if the user refreshes it still counts as disconnect
          if(ActiveRooms[index])
          setTimeout(function() { if(ActiveRooms[index])deleteIfEmpty(ActiveRooms[index].roomid); }, 2000);
          delete Voters[socket.id];
        }
      }
    }

  });
});


//start server on localhost 3000

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
