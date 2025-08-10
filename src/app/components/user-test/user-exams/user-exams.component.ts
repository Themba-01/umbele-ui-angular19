import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserExam } from '../../../models/exam-models';
import { ExamService } from '../../../services/exam.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-user-exams',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-exams.component.html',
  styleUrl: './user-exams.component.css'
})
export class UserExamsComponent {

  userExams: UserExam[] = [];
  userId: number = 0;

  constructor(private examService: ExamService, private router: Router,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.userId = this.loginService.userId;
    this.examService.getUserExams(this.userId).subscribe((data) => {
      this.userExams = data.map((exam) => ({
        ...exam,
        status: exam.finishedOn ? 'Completed' : 'Abandoned', // Map In Progress to Abandoned
      }));
    });
  }

  resumeExam(examId: number): void {
    this.router.navigate(['/exam'], { state: { examId }, queryParams: { examId } });
  }
  takeToCompletedExam(examId: number): void {
    this.router.navigate(['/exam/view-result'], { state: { examId }, queryParams: { examId } });
  }
}
