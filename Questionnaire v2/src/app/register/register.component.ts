import { Component, OnInit } from '@angular/core';
import {AuthService} from "../Services/auth.service";
import {User} from "../models/user.model";
import {Router} from "@angular/router";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  registerUser(login: string, password: string, password2: string){
    if(password!=password2){
      alert("Passwords don't match, try again!");
      return
    }
    let newUser= new User(login, password);
    console.log(newUser);
    this.auth.registerUser(newUser).subscribe(
      res=>{
        console.log(res)
        localStorage.setItem('token', res.token);
        localStorage.setItem('login', res.login);
        localStorage.setItem('userid', res.userid);
        this.router.navigate(['/home'])
      }
    );
  }
}
