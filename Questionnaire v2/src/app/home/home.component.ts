import { Component, OnInit } from '@angular/core';
import {AuthService} from "../Services/auth.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  loggedin = false;
  id: string = '';
  username: string|null='';
  constructor(private auth: AuthService) { }

  ngOnInit(): void {
    this.loggedin=this.auth.loggedIn();
      this.username = localStorage.getItem('login');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('login');
    localStorage.removeItem('userid');
    window.location.reload();
  }

  readRoomId(id: HTMLInputElement){
    let output = id.value.split('');
    for(let char of output){
      if(isNaN(Number(char))){
        id.value = id.value.substring(0,id.value.length -1);

      }
    }
    this.id=id.value.toString();
  }

}
