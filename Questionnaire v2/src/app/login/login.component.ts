import { Component, OnInit } from '@angular/core';
import {User} from "../models/user.model";
import {AuthService} from "../Services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  loginUser(login: string, password: string){
    let user= new User(login, password);
    console.log(user);
    this.auth.loginUser(user).subscribe( res=>{
      localStorage.setItem('token', res.token);
      localStorage.setItem('login', res.login);
      localStorage.setItem('userid', res.userid);
      console.log(res);
      this.router.navigate(['/home'])
    });
  }


}
