import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskModel } from '../models/tasksModel'
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  messageForm: FormGroup;
  tasks: TaskModel[];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.createForm()
    this.tasks = [];
  }

  createForm() {
    this.messageForm = this.fb.group({
      message: ['', Validators.required], // <--- the FormControl called "name"
      delay: [, [Validators.required, Validators.min(1), Validators.max(8)]], // <--- the FormControl called "name"
    });
  }

  onSubmit() {
    let task = new TaskModel(
      this.messageForm.get('message').value, 
      this.messageForm.get('delay').value, 
      'PENDING')
    this.messageForm.reset()
    this.tasks.unshift(task)
    task.sendToServer(this.http).subscribe(
      (data) => {
          console.log(data)
          if(data.status) {
            task.status = 'DONE'
          }
      },
      (error) => {
          console.log(error)
          task.status = 'ERROR'
      }
  )
    }
}
