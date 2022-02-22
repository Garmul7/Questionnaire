import { Component, OnInit } from '@angular/core';
import {SocketService} from "../Services/socket.service";

import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-client-question',
  templateUrl: './client-question.component.html',
  styleUrls: ['./client-question.component.css']
})
export class ClientQuestionComponent implements OnInit {

  constructor(private socketService: SocketService, private route: ActivatedRoute) {

  }

  roomid: number;
  selection: number = 5;
  questionNum: number;
  possibleAns: number;

  ngOnInit(): void {
    this.questionNum=404;
    this.possibleAns=404;
    let stringId;
    let id: number;
    stringId = this.route.snapshot.paramMap.get('roomid');
    if(stringId) {
      id = + stringId;
      this.roomid=id;
      //console.log(id);
      this.socketService.joinRoom(id);
    }

    this.socketService.errorsub.subscribe(v=> {alert(v)});


    //when question is changed by host
    this.socketService.changeQuestionSub.subscribe(res =>{
      // selection returns to value of 5 (invalid)
      this.selection = 5;
      // deselect all the radio buttons
      let selections = document.getElementsByName('radioname');
      selections.forEach(sel => {
        let selec = sel as HTMLInputElement
        selec.checked = false;
      })

      //update question number and get the number of possible answers
      if(Array.isArray(res)) {
        this.questionNum = res[0];
        this.possibleAns = res[1];
      }
    })
  }

  select(event: any) {
    this.selection = event.target.value;
  }

  sendVote(): void {
    console.log(this.selection);
    let vote: number =+this.selection;
    this.socketService.sendVote(vote);
  }

}
