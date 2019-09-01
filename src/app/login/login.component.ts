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

  constructor(private socketService : WebSocketService, private router : Router) { }

  ngOnInit() {
    this.socketService.listen('login').subscribe((data)=>{
      localStorage.setItem('username', data[0]);
      localStorage.setItem('perms', data[1]);
      console.log(data[0]);
      console.log(data[1]);
      this.router.navigate(['/', 'manager']);
    });
  }

  login(){
    this.socketService.send('login', [this.username, this.email]);
  }

}
