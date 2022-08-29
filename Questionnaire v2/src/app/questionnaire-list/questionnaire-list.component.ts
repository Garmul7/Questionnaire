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
  questionnaireList: any = [];
  operation: string;
  generatedRoomId: number;
  currentQuestion: number;
  votes: number[][];
  constructor(private socketService: SocketService ,private databaseService: DatabaseService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.getQuestionnaires()
    this.operation = this.route.snapshot.paramMap.get('operation')
  }

  getQuestionnaires(): void {
    this.databaseService.getQuestionnaireNames().subscribe(questionnaireList => {this.questionnaireList=questionnaireList; console.log(this.questionnaireList)})
  }

  deleteQuestionnaire(questionnaire: Questionnaire): void{
    if(confirm(`Are you sure you want to delte Questionnaire ${questionnaire.qTopic} ?`)) {
      this.databaseService.deleteQuestionnaire(questionnaire._id).subscribe(res => console.log(res));
      let index = this.questionnaireList.indexOf(questionnaire);
      this.questionnaireList.splice(index, 1);
    }
  }

  redirect(questionnaire: Questionnaire): void {

    if(this.operation=="host"){
      if(questionnaire.votes.length>0) {
        this.socketService.createRoom(questionnaire.votes)
        this.socketService.roomidsub.subscribe(x => {
          if (Array.isArray(x)) {
            if (typeof x[0] == 'number' && typeof x[1] == 'number' && Array.isArray(x)) {
              this.generatedRoomId = x[0];
              //console.log(this.generatedRoomId);
              this.currentQuestion = x[1];
              //console.log(this.currentQuestion);
              this.votes = x[2];
              //console.log(this.votes);
              this.router.navigate(['/qhost', {questionnaireid: questionnaire._id, roomid: this.generatedRoomId}])
            }

          }

        })
      }else{window.alert('Cannot host an empty Questionnaire!')}
    }
    if(this.operation=="edit"){
      this.router.navigate(['/edit', {questionnaireid: questionnaire._id}])
    }
  }


}

