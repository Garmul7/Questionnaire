

// sockets
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();

const jwt = require('jsonwebtoken');

const questionnaireController=require('./routes/questionnaireController');
const accountController=require('./routes/accountController');
const e = require('express');

app.use('/questionnaire', questionnaireController);
app.use('/account', accountController);



// SOCKETS ROOMS AND VOTING /////////////////////////////////////////////////////////////////

const ActiveRooms=[];
const Voters=[];
const VotesSent=[];

function verifyToken(token){
  if(!token){
      return false;
  }
  
 // let token=req.headers.authorization.split(' ')[1];
  if(token==null){
      return false;
  }
  try{
    let payload = jwt.verify(token, 'secretKey');
    if(!payload){
        return false;
    }
    else return payload.subject;
  }
  catch{return false;}
}


// Assign the socket with roomid and remember them in active rooms
function hostRoom(roomid, currentQuestion, answers, users, host) {
  const room = {roomid, currentQuestion, answers, users, host};
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
  console.log('connection');
  // HOST PART //////////////////////////////////////////////////////////////////////////////////

    // When server recieves a hostRoom command, create a new room that will host a questionnaire
  socket.on('hostRoom', (votes, token) => {
    let host = verifyToken(token);
    if(!host){
      console.log('unauthorized host room');
      return;
    }
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

    const room = hostRoom(newRoomid,  0, votes, [], host);
    console.log(room)
    joinRoom(socket.id, newRoomid)

    socket.join(room.roomid);

    console.log(`socket ${socket.id} hosted room ${room.roomid}`);

    socket.emit('generatedRoom', room.roomid, 0, (votes));
    console.log(`Rooms currently runnig: ${ActiveRooms.length}`);
    console.log(ActiveRooms)
  

  });


  // When host refreshes room he gets all the information again from the server
  socket.on('getHostedRoom', (roomid, token) => {
    console.log('host reloaded')
    let host = verifyToken(token);
    if(!host){
      console.log('unauthorized get host room');
      return;
    }
    const hostedRoom = ActiveRooms.find(room => room.roomid === roomid);
    if(hostedRoom)
    if(hostedRoom.host != host){
      console.log(`user ${host} is not a host of ${hostedRoom}`);
      return;
    }
    if(hostedRoom){
      hostedRoom.users.push(socket.id)
      joinRoom(socket.id, roomid)
      console.log(hostedRoom)
      socket.join(roomid);
      socket.emit('generatedRoom', roomid, hostedRoom.currentQuestion, hostedRoom.answers);
    } else{ socket.emit('error', 'Room not found'); return;}
  });

  // Change question for room and give the current question to all voters
  socket.on('changeQuestion', (currentQuestion, roomid, token) => {
    let host = verifyToken(token);
    if(!host){
      console.log('unauthorized change question');
      return;
    }
    console.log('recieved change question')
    const hostedRoom = ActiveRooms.find(room => room.roomid === roomid);
    if(hostedRoom)
    if(hostedRoom.host != host){
      console.log(`user ${host} is not a host of ${hostedRoom}`);
      return;
    }
    if(hostedRoom) {
      hostedRoom.currentQuestion= currentQuestion;
      let possibleAns=hostedRoom.answers[currentQuestion].length;
      console.log('changed question, currentQ, possibleAns')
      console.log(currentQuestion, possibleAns)
      io.to(roomid).emit('currentQuestion', currentQuestion, possibleAns); // HERE IO EMIT RETARD
    } else {socket.emit('error', 'Room not found'); return;}
  });


  // VOTER PART //////////////////////////////////////////////////////////////////////////////////

  // Join a hosted room
  socket.on('joinRoom', (joinroomid) => {
    const hostedRoom = ActiveRooms.find(room => room.roomid === joinroomid);
    if(hostedRoom){
      socket.join(hostedRoom.roomid);
      hostedRoom.users.push(socket.id);
      joinRoom(socket.id, hostedRoom.roomid);
      console.log(`user ${socket.id} connected to ${hostedRoom.roomid}`);
      console.log(`curret users: ${Voters}`);
      console.log(Voters)
      
      cq = hostedRoom.currentQuestion

      VotesSent[socket.id]=[];
      for(let i = 0; i<hostedRoom.answers.length; i++){
        VotesSent[socket.id][i]=0;
      }
      console.log(VotesSent[socket.id]);


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
        if(VotesSent[socket.id][currentQuestion] != 1){
        ActiveRooms[index].answers[currentQuestion][vote]+=1;
        console.log(`Recieved vote ${vote} for question ${currentQuestion}, roomid ${voterroom}`)
        console.log(`Answers: ${ActiveRooms[index].answers[currentQuestion]}`);
        VotesSent[socket.id][currentQuestion]=1;
        console.log(VotesSent[socket.id]);
        io.to(voterroom).emit('vote', (ActiveRooms[index].answers[currentQuestion]));
        }else {socket.emit('error', 'Vote for this question already sent'); return;}
      }else {socket.emit('error', 'Room not found'); return;}
    }else{socket.emit('error', 'Recieved wrong vote request'); return;}
  });

  // On disconnect, delete users, check if room is empty, if it is, delete room
  socket.on('disconnect', () => {
    //delete the voter information
    if(VotesSent[socket.id]){
      delete VotesSent[socket.id];
    }
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

