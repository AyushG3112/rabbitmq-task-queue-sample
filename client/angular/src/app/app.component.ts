import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskModel } from '../models/tasksModel';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  messageForm: FormGroup;
  tasks: TaskModel[];
  minDelay: number = 1;
  maxDelay: number = 8;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.createForm();
    this.tasks = [];
  }

  createForm() {
    this.messageForm = this.fb.group({
      message: ['', Validators.required],
      delay: [, [Validators.required, Validators.min(this.minDelay), Validators.max(this.maxDelay)]]
    });
  }

  onSubmit() {
    let task = new TaskModel(
      this.messageForm.get('message').value,
      this.messageForm.get('delay').value,
      'PENDING'
    );
    this.messageForm.reset();
    this.tasks.unshift(task);
    task.sendToServer(this.http).subscribe(
      data => {
        console.log(data);
        if (data.status) {
          task.responseTime = new Date();
          task.status = 'DONE';
        }
      },
      error => {
        console.log(error);
        task.status = 'ERROR';
      }
    );
  }

  clearTaskList() {
    this.tasks = [];
  }
}
