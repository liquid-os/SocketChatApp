import { Component, OnInit } from '@angular/core';
import { WebSocketService } from '../web-socket.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email : string;
  username : string;
  password : string;

  constructor(private socketService : WebSocketService, private router : Router) { }

  ngOnInit() {
    this.socketService.listen('login').subscribe((data)=>{
      localStorage.setItem('username', data[0]);
      localStorage.setItem('perms', data[1]);
      this.router.navigate(['/', 'manager']);
    });
    this.socketService.listen('unauth').subscribe((data)=>{
      alert("Invalid password for existing user "+data+"! Please log in again.");
      this.username = "";
      this.email = "";
      this.password = "";
    });
  }

  allFieldsFilled(){
    if(this.email == "" || this.username == "" || this.password == ""){
      return false;
    }else{
      return true;
    }
  }

  login(){
    if(this.allFieldsFilled() == false){
      alert("Please fill in all of the required fields.");
    }else
    this.socketService.send('login', [this.username, this.email, this.password]);
  }
}
