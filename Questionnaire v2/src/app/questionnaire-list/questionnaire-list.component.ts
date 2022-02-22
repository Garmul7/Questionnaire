import { Component, OnInit } from '@angular/core';
import {DatabaseService} from "../Services/database.service";
import {Questionnaire} from "../models/questionnaire.model";
import {SocketService} from "../Services/socket.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-questionnaire-list',
  templateUrl: './questionnaire-list.component.html',
  styleUrls: ['./questionnaire-list.component.css']
})
export class QuestionnaireListComponent implements OnInit {
  questionnaireList: Questionnaire[];
  operation: string;
  generatedRoomId: number;
  currentQuestion: number;
  votes: number[][];
  constructor(private socketService: SocketService ,private databaseService: DatabaseService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.getQuestionnaires()
  }

  getQuestionnaires(): void {
    this.databaseService.getQuestionnaires().subscribe(questionnaireList => this.questionnaireList = questionnaireList)
  }

  redirect(questionnaire: Questionnaire): void {
    let op = this.route.snapshot.paramMap.get('operation')
    if(op=="host"){
      this.socketService.createRoom(questionnaire._id, questionnaire.votes)
      this.socketService.roomidsub.subscribe( x => {
        if(Array.isArray(x)){
          if(typeof x[0] == 'number' && typeof x[1] == 'number' && Array.isArray(x[2])){
            this.generatedRoomId=x[0];
            this.currentQuestion=x[1];
            this.votes=x[2];
          }
        }
        this.router.navigate(['/qhost', {questionnaireid: questionnaire._id, roomid: this.generatedRoomId}])
      })

    }
    if(op=="edit"){
      this.router.navigate(['/edit', {questionnaireid: questionnaire._id}])
    }
  }


}

