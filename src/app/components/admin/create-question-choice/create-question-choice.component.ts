import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
@Component({
  selector: 'app-create-question-choice',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-question-choice.component.html',
  styleUrl: './create-question-choice.component.css',
})
export class CreateQuestionChoiceComponent {
 
}