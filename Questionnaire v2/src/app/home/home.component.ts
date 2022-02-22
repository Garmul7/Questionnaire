import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {


  id: string = '';
  constructor() { }

  ngOnInit(): void {
  }

  readRoomId(id: HTMLInputElement){
    let output = id.value.split('')
    for(let char of output){
      if(isNaN(Number(char))){
        id.value = id.value.substring(0,id.value.length -1);

      }
    }
    this.id=id.value.toString();
  }

}
