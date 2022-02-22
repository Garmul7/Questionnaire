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
    createRoom(questionnaireID: string, votes: number[][]) {
      console.log(`sending create room ${questionnaireID}`);
      this.socket.emit('hostRoom', questionnaireID, votes);
    }

    //subscribe to recieve the roomid and other parameters of the room (just in case of refresh)
    roomidsub = new Observable(subscriber => {
      this.socket.on('generatedRoom', (roomid: number, currentQuestion: number, votes: number[][]) => {
        let returnvalue=[roomid, currentQuestion, votes];
        console.log(`received roomid ${roomid}`)
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
    this.socket.emit('getHostedRoom', roomid);
  }

  //change question to the next / previous one so server can change the answers for voters
    changeQuestion(currentQuestion: number, roomid: number) {
      console.log(`Changing to question ${currentQuestion} room ${roomid}`);
      this.socket.emit('changeQuestion', currentQuestion, roomid);
    }

    //voter ////////////////////////////////////////////////////////////////////////////////////////////////


  joinRoom(roomid: number) {
    this.socket.emit('joinRoom', (roomid));
  }

  sendVote(vote: number) {
      this.socket.emit('sendVote', vote);
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
