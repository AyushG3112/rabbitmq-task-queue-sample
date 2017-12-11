import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  messageForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.createForm()
  }

  createForm() {
    this.messageForm = this.fb.group({
      message: ['', Validators.required], // <--- the FormControl called "name"
      delay: [, [Validators.required, Validators.min(1)]], // <--- the FormControl called "name"
    });
  }

  onSubmit(event: any) {
    console.log(event)
  }
}
