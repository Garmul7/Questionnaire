import { Component, OnInit } from '@angular/core';
import {Questionnaire} from "../models/questionnaire.model";
import {QuestionModel} from "../models/question.model";

import {SocketService} from "../Services/socket.service";
import {ActivatedRoute} from "@angular/router";
import {DatabaseService} from "../Services/database.service";


@Component({
  selector: 'app-host-question',
  templateUrl: './host-question.component.html',
  styleUrls: ['./host-question.component.css']
})
export class HostQuestionComponent implements OnInit {

  questionnaire: Questionnaire;
  questionList: QuestionModel[];

  generatedRoomId;
  currentQuestion;
  votes: number[][];

  showvotes: boolean;

  ansLetter=["A", "B", "C", "D"];

  constructor(private socketService: SocketService,  private route: ActivatedRoute, private databaseService: DatabaseService) {


    let q1 = new QuestionModel("404", ["404", "404", "404", "404"])
    this.questionList = [q1];
    this.questionnaire= new Questionnaire( "404", this.questionList )
    this.generatedRoomId=0;
    this.currentQuestion=0;
  }



  ngOnInit(): void {
    this.showvotes = false;
    //get the id read in params
    this.route.params.subscribe(params => {
      const qid = params['questionnaireid'];
      this.generatedRoomId = parseInt(params['roomid']);
      //get the questionnaire from database
      console.log(this.generatedRoomId);
      this.socketService.getHostedRoom(this.generatedRoomId);
      this.databaseService.getQuestionnaireById(qid).subscribe(questionnaire => {
        //get the questionnaire
        this.questionnaire = questionnaire;
        if(this.votes) // this if is for when the questionnaire is loaded later then the room
          this.questionnaire.votes = this.votes;
        //get the room from the server

      })
    });

    this.socketService.roomidsub.subscribe( x => {
      console.log(x)
      if(Array.isArray(x)){
        if(typeof x[0] == 'number' && typeof x[1] == 'number' && Array.isArray(x[2])){
          this.generatedRoomId=x[0];
          this.currentQuestion=x[1];
          this.questionnaire.votes=x[2];
          this.votes = x[2];
        }
      }
    })

    this.socketService.roomvotesub.subscribe(v => {
      console.log(v);
      if(Array.isArray(v)) {
        this.questionnaire.votes[this.currentQuestion] = v
      }
      this.updateVotes()

    });


    this.socketService.errorsub.subscribe(v=> {alert(v + ', try hosting again')})

  }

  prevQ(){
    if(this.currentQuestion>0){
      this.currentQuestion-=1;
      this.socketService.changeQuestion(this.currentQuestion, this.generatedRoomId);
      this.showvotes= false
    }
  }

  nextQ(){
    if(this.currentQuestion<this.questionnaire.qQuestions.length-1){
      this.currentQuestion+=1;
      this.socketService.changeQuestion(this.currentQuestion, this.generatedRoomId);
      this.showvotes= false
    }
  }

  showVotes(){
    this.showvotes= !this.showvotes
    console.log(this.showvotes)
    this.updateVotes()
  }

  updateVotes(){
    console.log('updating')

    let sum = 0;
    this.questionnaire.votes[this.currentQuestion].forEach(ans => sum += ans);
    console.log(sum)

    let array = ["A", "B", "C", "D"];
    array.forEach( (letter, index) => {
      let votes = this.questionnaire.votes[this.currentQuestion][index]

      let percentage = (votes / sum) *100;

      console.log(percentage)
      setTimeout(function() {let element = document.getElementById("choice"+letter);
      console.log(element);
      console.log(index);

      if(element) {

        let stringWidth= percentage.toString() + "%"
        console.log(stringWidth);
        element.style.width=stringWidth;
      }
      }, 10);



    })



  }

}
