

// sockets
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();

const jwt = require('jsonwebtoken');

const questionnaireController=require('./routes/questionnaireController');
const accountController=require('./routes/accountController');

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
function hostRoom(roomid, currentQuestion, answers, hostSocket, host_id) {
  const room = {roomid, currentQuestion, answers, hostSocket, host_id};
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
  if(index!=-1){
    if(ActiveRooms[index]){
      if(ActiveRooms[index].hostSocket == ''){
        ActiveRooms.splice(index, 1);
        console.log('ROOM DELETED')
        io.to(roomid).emit('error', 'The room has been deleted'); 
      }
    }
  }
  console.log(ActiveRooms)
}


const server = http.createServer(app);
const io = socketio(server);

// Run when client connects
io.on('connection', socket => {
  console.log('connection');
  // HOST PART //////////////////////////////////////////////////////////////////////////////////

  socket.on('hostRoom', (votes, token) => {
    let host = verifyToken(token);

    if(!host){
      console.log('unauthorized host room');
      return;
    }
    // if the host was already hosting without disconnecting but still decides to rehost, delete previous room
    if(Voters[socket.id]){
      const index = ActiveRooms.findIndex(room => room.roomid === Voters[socket.id]);
      if(index!=-1 && ActiveRooms[index])
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

    const room = hostRoom(newRoomid,  0, votes, socket.id, host);
    console.log('HOSTING ROOM')
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
    // token verification //////////////////
    let host = verifyToken(token);
    if(!host){
      console.log('unauthorized get host room');
      return;
    }
    const hostedRoom = ActiveRooms.find(room => room.roomid === roomid);
    if(hostedRoom)
    if(hostedRoom.host_id != host){
      console.log(`user ${host} is not a host of ${hostedRoom}`);
      socket.emit('error', 'You are not the host')
      return;
    }

    

    if(hostedRoom){
      //hostedRoom.users.push(socket.id)
      hostedRoom.hostSocket = socket.id
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
    const hostedRoom = ActiveRooms.find(room => room.roomid === roomid);
    if(hostedRoom)
    if(hostedRoom.host_id != host){
      socket.emit('error', 'You are not the host')
      console.log(`user ${host} is not a host of ${hostedRoom}`);
      return;
    }


    if(hostedRoom) {
      hostedRoom.currentQuestion= currentQuestion;
      let possibleAns=hostedRoom.answers[currentQuestion].length;
      console.log('changed question, currentQ, possibleAns')
      console.log(currentQuestion, possibleAns)
      io.to(roomid).emit('currentQuestion', currentQuestion, possibleAns); 
    } else {socket.emit('error', 'Room not found'); return;}
  });


  // VOTER PART //////////////////////////////////////////////////////////////////////////////////

  // Join a hosted room
  socket.on('joinRoom', (joinroomid) => {
    const hostedRoom = ActiveRooms.find(room => room.roomid === joinroomid);
    if(hostedRoom){
      socket.join(hostedRoom.roomid);
      //hostedRoom.users.push(socket.id);
      joinRoom(socket.id, hostedRoom.roomid);
      console.log(`user ${socket.id} connected to ${hostedRoom.roomid}`);
      console.log(`curret users:`);
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
    console.log('dissconnect')
    //delete the voter information
    if(VotesSent[socket.id]){
      delete VotesSent[socket.id];
    }
    
    if(Voters[socket.id]){
      let voterroom=Voters[socket.id];
      delete Voters[socket.id];
      const index = ActiveRooms.findIndex(room => room.roomid === voterroom);
      if(index!=-1){
        console.log(`room from which disconnected`)
        console.log(ActiveRooms[index])

        if(ActiveRooms[index].hostSocket == socket.id){
          ActiveRooms[index].hostSocket='';
          console.log('HOST DISCONNECTED');
          if(ActiveRooms[index])
          setTimeout(function() { if(ActiveRooms[index])deleteIfEmpty(ActiveRooms[index].roomid); }, 2000);
        }
          console.log(`room after dc`)
          console.log(ActiveRooms[index])

          // delay the deletion by a few seconds, because if the user refreshes it still counts as disconnect

        
      }
    }

  });
});


//start server on localhost 3000

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

