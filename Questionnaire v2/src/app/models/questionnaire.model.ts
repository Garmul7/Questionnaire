import {QuestionModel} from "./question.model";

export class Questionnaire{
  _id: string;
  qTopic: string;
  qQuestions: QuestionModel[];
  votes: number[][];

  constructor(qTopic: string, qQuestions: QuestionModel[]) {
    this.qTopic= qTopic;
    this.qQuestions= qQuestions;
    this.votes = [];
    for(let i=0; i<qQuestions.length; i++) {
      this.votes[i] = [];
      for(let j=0; j<qQuestions[i].nrOfAns; j++) {
        this.votes[i][j] = 0;
      }
    }
  }

}
