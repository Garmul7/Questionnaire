export class QuestionModel{

  // for now no image

  imagePath: string;
  qDesc: string;
  qAns: string[];
  constructor(qDesc: string, qAns: string[] ) {
    this.imagePath='';
    this.qDesc = qDesc;
    this.qAns = qAns;
  }
}
