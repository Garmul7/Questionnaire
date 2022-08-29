import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Questionnaire} from "../models/questionnaire.model";
import {QuestionModel} from "../models/question.model";
import {DatabaseService} from "../Services/database.service";
import {ActivatedRoute, Router} from "@angular/router";
import {createInput} from "@angular/compiler/src/core";

@Component({
  selector: 'app-questionnaire-edition',
  templateUrl: './questionnaire-edition.component.html',
  styleUrls: ['./questionnaire-edition.component.css']
})
export class QuestionnaireEditionComponent implements OnInit {
  @ViewChild('target') private myScrollContainer: ElementRef;


  questionnaireid: string;
  questionnaire: Questionnaire;

  imageData: string;
  ansInputNumber: number;

  qtopic: string;
  questionList: QuestionModel[];
  votes: number[][];


  constructor(private databaseService: DatabaseService, private route: ActivatedRoute, private router: Router) {
    this.questionList = [];
    this.votes = []
    this.ansInputNumber=2;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const questionnaireid = params['questionnaireid'];
      if(questionnaireid){
        this.questionnaireid = questionnaireid;
        this.databaseService.getQuestionnaireById(questionnaireid).subscribe(questionnaire => {
          //get the questionnaire
          this.questionnaire = questionnaire;
          this.questionList = questionnaire.qQuestions;
          this.qtopic = this.questionnaire.qTopic;

        })


      }else{alert('Cannot read params!')}

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

  /*
  onSubmit() {
    this.imageData = "";
  }
*/

  scrollToElement(el: HTMLElement): void {
    this.myScrollContainer.nativeElement.scroll({
      top: this.myScrollContainer.nativeElement.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
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


    this.imageData = null;
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
    let newTopic = prompt('Enter questionnaire topic for the copy');
    if(newTopic != null && newTopic.length < 48) {
      this.questionnaire = new Questionnaire(localStorage.getItem('userid'), newTopic, this.questionList)
      this.databaseService.AddQuestionnaire(this.questionnaire).subscribe();
    }else{window.alert('Topic cannot be empty or longer than 48 characters!')}
  }

  editQuestionnaire(): void{
    if(localStorage.getItem('userid')!=null) {
      this.questionnaire = new Questionnaire(localStorage.getItem('userid'), this.qtopic, this.questionList);
      console.log(this.questionnaire._id);
      console.log(this.questionnaireid);
      this.questionnaire._id = this.questionnaireid;
      this.databaseService.EditQuestionnaire(this.questionnaire).subscribe();
    }

  }

  editTopic(): void{
    let newTopic = prompt('Enter new questionnaire topic');
    if(newTopic != null && newTopic.length < 48){
      this.qtopic=newTopic;
    }else{window.alert('New topic cannot be empty or longer than 48 characters!')}
  }
}
