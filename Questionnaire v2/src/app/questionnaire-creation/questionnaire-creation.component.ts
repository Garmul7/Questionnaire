import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Questionnaire} from "../models/questionnaire.model";
import {QuestionModel} from "../models/question.model";

import {DatabaseService} from "../Services/database.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FormGroup, FormControl, Form} from "@angular/forms";

@Component({
  selector: 'app-questionnaire-creation',
  templateUrl: './questionnaire-creation.component.html',
  styleUrls: ['./questionnaire-creation.component.css']
})
export class QuestionnaireCreationComponent implements OnInit {
  imageData: string;

  @ViewChild('target') private myScrollContainer: ElementRef; // used for scrolling down

  questionnaire: Questionnaire;

  topicCreated: boolean;
  ansInputNumber: number;

  qtopic: string;
  questionList: QuestionModel[];
  votes: number[][];


  constructor(private databaseService: DatabaseService, private route: ActivatedRoute, private router: Router) {
    this.questionList = [];
    this.votes = []
    this.topicCreated=false;
    this.ansInputNumber=2;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const topic = params['topic'];

      if(topic){
        this.qtopic=topic;
        this.topicCreated=true;
      }

    })
  }

  onFileSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];

    const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (file && allowedMimeTypes.includes(file.type)) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageData = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    this.imageData = "";
  }


  scrollToElement(el: HTMLElement): void {
    this.myScrollContainer.nativeElement.scroll({
      top: this.myScrollContainer.nativeElement.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }

// if the topic is not created then make one
  addTopic(topicInput: string): void {
    if(topicInput!=""){
      this.qtopic = topicInput.charAt(0).toUpperCase() + topicInput.slice(1);
      this.topicCreated=true;
      this.router.navigate(['/create', { topic: topicInput}])
    }
    else{
      window.alert("Topic must not be empty!")
    }
  }

// add question to temporary questionList
  addQuestion(questionInput: string): void {
    if(questionInput!="") {
      let inputAnswers = document.getElementsByClassName("ansInputs");
      let qAns = [];
      for (let i = 0; i < inputAnswers.length; i++) {
        let inp = inputAnswers[i] as HTMLInputElement;
        if (inp.value != "") {
          qAns.push(inp.value.charAt(0).toUpperCase() + inp.value.slice(1));
        }
      }
      if(qAns.length<2){
        alert("There must be at least 2 answers")
        return
      }
      let question = new QuestionModel(questionInput.charAt(0).toUpperCase() + questionInput.slice(1), qAns)
      question.imagePath=this.imageData;
      this.questionList.push(question);

      this.votes[this.questionList.length]=[]

      for (let i = 0; i < inputAnswers.length; i++) {
        let inp = inputAnswers[i] as HTMLInputElement;
        inp.value = '';
      }
      let qin = document.getElementById("questionI") as HTMLInputElement
      qin.value = '';
    }
    else{
      window.alert("Question cannot be empty!")
    }
    let container = document.getElementById("creatorContainer")

    setTimeout(() => {
      if(container){
        container.scrollTo(0, container.scrollHeight)
      }
    },0)


    this.imageData = "";
  }

  deleteQuestion(index: number){
    this.questionList.splice(index, 1)
  }

  moveUp(index: number){
    if(index!=0){
      [this.questionList[index], this.questionList[index-1]] = [this.questionList[index-1], this.questionList[index]];
    }
  }

  moveDown(index: number){
    if(index!=this.questionList.length-1){
      [this.questionList[index], this.questionList[index+1]] = [this.questionList[index+1], this.questionList[index]];
    }
  }

  // create the questionnaire from questionList and save it in database
  saveQuestionnaire(): void {
    for(let i=0; i<this.questionList.length; i++){
      for(let j=0; j<this.questionList[i].qAns.length; j++){
      }
    }
    this.questionnaire= new Questionnaire(this.qtopic, this.questionList)

    this.databaseService.AddQuestionnaire(this.questionnaire).subscribe();

  }



}
