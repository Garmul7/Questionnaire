export class QuestionModel{

  // for now no image

  imagePath: string;

  qDesc: string;
  qAns: string[];
  nrOfAns: number;
  constructor(qDesc: string, qAns: string[] ) {
    this.qDesc = qDesc;
    this.qAns = qAns;
    this.nrOfAns = qAns.length;
  }
}
