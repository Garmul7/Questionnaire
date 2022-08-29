import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {User} from "../models/user.model";

import {Questionnaire} from "../models/questionnaire.model";

import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  private registerUrl = "http://192.168.1.19:3000/account/register";
  private loginUrl = "http://192.168.1.19:3000/account/login";

  registerUser(user: User){
    return this.http.post<any>(this.registerUrl, user);

  }

  loginUser(user: User){
    return this.http.post<any>(this.loginUrl, user);
  }

  loggedIn(){
    return !!localStorage.getItem('token');
  }

  getToken(){
    return localStorage.getItem('token');
  }
}
