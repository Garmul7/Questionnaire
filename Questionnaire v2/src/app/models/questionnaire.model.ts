import {QuestionModel} from "./question.model";

export class Questionnaire{
  _id: string;
  userid: string;
  qTopic: string;
  qQuestions: QuestionModel[];
  votes: number[][];

  constructor(userid: string,  qTopic: string, qQuestions: QuestionModel[]) {
    this.userid= userid;
    this.qTopic= qTopic;
    this.qQuestions= qQuestions;
    this.votes = [];
    for(let i=0; i<qQuestions.length; i++) {
      this.votes[i] = [];
      for(let j=0; j<qQuestions[i].qAns.length; j++) {
        this.votes[i][j] = 0;
      }
    }


  }



}
