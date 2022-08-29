import {QuestionModel} from "./question.model";

export class User {
  _id: string;
  login: string;
  password: string;

  constructor(login: string, password: string) {
    this.login = login;
    this.password = password;
  }

}

