import { Injectable } from '@angular/core';
import { Socket} from "ngx-socket-io";
import {Observable} from "rxjs";
import {of} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(private socket: Socket) {
    this.socket.on('vote', (votes: number[][]) => {
      console.log('recieved votes')
      let returnvalue=votes;

    });
  }
  //host/////////////////////////////////////////////////////////////////////////////////

  //ask server to create room
    createRoom(votes: number[][]) {
      this.socket.emit('hostRoom',  votes, localStorage.getItem('token'));
    }

    //subscribe to recieve the roomid and other parameters of the room (just in case of refresh)
    roomidsub = new Observable(subscriber => {
      this.socket.on('generatedRoom', (roomid: number, currentQuestion: number, votes: number[][]) => {
        let returnvalue=[roomid, currentQuestion, votes];
        // console.log(`received roomid ${roomid}`);
        // console.log(`current question ${currentQuestion}`);
        // console.log(`votes ${votes}`);
        subscriber.next(returnvalue);
      });
    });

  roomvotesub = new Observable(subscriber => {
    this.socket.on('vote', (votes: number[][]) => {
      console.log('recieved votes')
      let returnvalue=votes;
      subscriber.next(returnvalue);
    });
  });



  getHostedRoom(roomid: number){
    this.socket.emit('getHostedRoom', roomid, localStorage.getItem('token'));
  }

  //change question to the next / previous one so server can change the answers for voters
    changeQuestion(currentQuestion: number, roomid: number) {
      console.log(`Changing to question ${currentQuestion} room ${roomid}`);
      this.socket.emit('changeQuestion', currentQuestion, roomid, localStorage.getItem('token'));
    }

    //voter ////////////////////////////////////////////////////////////////////////////////////////////////


  joinRoom(roomid: number) {
    this.socket.emit('joinRoom', (roomid));
  }

  sendVote(vote: number) {
      this.socket.emit('sendVote', vote);
  }

  dissconnect(){
    this.socket.disconnect();
  }

  changeQuestionSub = new Observable(subscriber => {
    this.socket.on('currentQuestion', (currentQuestion: number, possibleAns: number) =>{
      subscriber.next([currentQuestion, possibleAns])
    })
  })

// receive error from server
  errorsub = new Observable(subscriber => {
    this.socket.on('error', (msg: string) => {
      console.log('ERROR')
      subscriber.next(msg);
    })
  })


}
