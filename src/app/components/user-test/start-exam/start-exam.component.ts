import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../../services/login.service';
import { ExamService } from '../../../services/exam.service';
import {
  ExamMetaData,
  QuestionDetails,
  QuestionStatus,
  StartExamRequest,
  UpdateUserQuestionChoice,
  UserExamQuestions,
} from '../../../models/exam-models';
import { catchError, of, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { VideoScrollComponent } from '../../video-scroll/video-scroll.component';
import { IndividualConfig, ToastrService } from 'ngx-toastr';
import { Course } from '../../../models/course';
import { CoursesService } from '../../../services/courses.service';
import hljs from 'highlight.js';

@Component({
  selector: 'app-start-exam',
  imports: [FormsModule, CommonModule, VideoScrollComponent],
  templateUrl: './start-exam.component.html',
  styleUrls: ['./start-exam.component.css'],
  standalone: true, // Assuming this is a standalone component; adjust if it's part of a module
})
export class StartExamComponent implements OnInit, OnChanges, AfterViewChecked {
  showWarning = false;
  @Input() courseId: number = 0;
  @Input() existingExamId: number = 0;
  userId: number = 0;
  examMetaData: ExamMetaData | null = null;
  @Input() selectedCourse: Course | undefined | null = null;

  questionStatuses: QuestionStatus[] = [];
  userExamQuestions: UserExamQuestions[] = [];
  currentQuestionIndex: number = 0;
  selectedChoice: number | null = null;
  currentQuestionDetails: QuestionDetails | null = null;
  markForReview: boolean = false;
  isCodeChecked: boolean = false;
  allQuestionDetails: QuestionDetails[] = []; // Store all preloaded questions
  selectedChoiceText: string = '';

  constructor(
    private loginService: LoginService,
    private examService: ExamService,
    private router: Router,
    private toastr: ToastrService,
    private courseService: CoursesService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['existingExamId'] && this.existingExamId > 0) {
      this.getExamMetaData();
    }
    this.updateSelectedChoiceText();
  }

  ngOnInit(): void {
    this.loginService.claims$.subscribe(() => {
      this.userId = this.loginService.userId;
      if (this.existingExamId === 0) {
        this.startExam();
      } else {
        this.getExamMetaData();
      }
    });
  }

  ngAfterViewChecked(): void {
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }

  getCourses(): void {
    this.courseService.getAllCourses().subscribe((courses) => {
      this.selectedCourse = courses.find(
        (course) => course.courseId === this.examMetaData?.courseId
      );
    });
  }

  getExamMetaData(): void {
    this.examService
      .getExamMetaData(this.existingExamId)
      .pipe(
        catchError((error) => {
          console.error('Error retrieving exam metadata:', error);
          if (error.status === 404 || error.status === 403) {
            this.router.navigate(['/user-exams']);
          }
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response) {
          this.examMetaData = response;
          this.getCourses();
          if (!this.examMetaData.finishedOn) {
            this.loadExamQuestions();
          } else {
            const config: Partial<IndividualConfig> = {
              closeButton: false,
              progressBar: true,
              positionClass: 'toast-top-full-width',
            };
            this.toastr.info(
              'Your Exam has completed already!',
              'Exam Completed',
              config
            );
            this.router.navigate(['/user-exams']);
          }
        }
      });
  }

  get currentQuestion(): UserExamQuestions | null {
    return this.userExamQuestions &&
      this.currentQuestionIndex >= 0 &&
      this.currentQuestionIndex < this.userExamQuestions.length
      ? this.userExamQuestions[this.currentQuestionIndex]
      : null;
  }

  async startExam(): Promise<void> {
    const token = await this.loginService.getToken();
    if (!token) {
      this.toastr.error('Failed to acquire token.', 'Error');
      return;
    }
    const request: StartExamRequest = {
      userId: this.userId,
      courseId: this.courseId,
    };
    this.examService.startExam(request).subscribe({
      next: (response) => {
        this.examMetaData = response;
        this.loadExamQuestions();
      },
      error: (error) => {
        console.error('Failed to start exam:', error);
        this.toastr.error(`Failed to start exam: ${error.message}`, 'Error', {
          timeOut: 0,
          closeButton: true,
          progressBar: true,
          positionClass: 'toast-top-full-width',
        });
        this.router.navigate(['/user-exams']);
      },
    });
  }

  initializeQuestionStatuses(): void {
    this.questionStatuses = this.userExamQuestions.map((question) => ({
      questionId: question.questionId,
      status: question.selectedChoiceId > 0 ? 'Answered' : 'Not Started',
    }));
  }

  loadExamQuestions(): void {
    const examIdToLoad: number =
      this.existingExamId > 0 ? this.existingExamId : this.examMetaData?.examId || 0;
    if (examIdToLoad < 1) return;

    this.examService
      .getUserExamQuestions(examIdToLoad)
      .subscribe((response) => {
        this.userExamQuestions = response;
        this.initializeQuestionStatuses();

        // Preload all question details
        const questionIds = this.userExamQuestions.map((q) => q.questionId);
        this.examService.getAllQuestionsAndChoices(questionIds).subscribe((questionDetails) => {
          this.allQuestionDetails = questionDetails;
          this.loadQuestion(this.userExamQuestions[this.currentQuestionIndex].questionId);
        });
      });
  }

  loadQuestion(questionId: number): void {
    if (!questionId || !this.userExamQuestions) return;

    const question = this.userExamQuestions.find((q) => q.questionId === questionId);
    this.currentQuestionDetails = this.allQuestionDetails.find(
      (q) => q.questionId === questionId
    ) || null;

    this.selectedChoice = question?.selectedChoiceId ?? null;
    this.markForReview = question?.reviewLater ?? false;

    const questionStatus = this.questionStatuses.find(
      (qs) => qs.questionId === questionId
    );
    // Optionally update status to 'In Progress' if needed
    // if (questionStatus) questionStatus.status = 'In Progress';
  }

  goToPreviousQuestion(): void {
    this.saveCurrentQuestionState();
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.loadQuestion(this.userExamQuestions[this.currentQuestionIndex].questionId);
    }
  }

  saveCurrentQuestionState(): void {
    if (this.userExamQuestions[this.currentQuestionIndex]) {
      this.userExamQuestions[this.currentQuestionIndex].selectedChoiceId =
        this.selectedChoice || 0;
      this.userExamQuestions[this.currentQuestionIndex].reviewLater = this.markForReview;
    }
  }

  // submitAndNext(): void {
  //   if (!this.selectedChoice) {
  //     this.showWarning = false;
  //     this.moveToNextQuestion();
  //     return;
  //   }

  //   this.showWarning = false;

  //   if (this.selectedChoice !== null && this.examMetaData) {
  //     const userChoice: UpdateUserQuestionChoice = {
  //       examId: this.examMetaData.examId,
  //       examQuestionId: this.userExamQuestions[this.currentQuestionIndex].examQuestionId,
  //       selectedChoiceId: this.selectedChoice,
  //       reviewLater: this.markForReview,
  //     };

  //     this.examService.updateUserChoice(userChoice).subscribe(() => {
  //       const questionStatus = this.questionStatuses.find(
  //         (qs) => qs.questionId === this.userExamQuestions[this.currentQuestionIndex].questionId
  //       );

  //       if (questionStatus) questionStatus.status = 'Answered';

  //       this.saveCurrentQuestionState();
  //       this.moveToNextQuestion();
  //     });
  //   }
  // }
  submitAndNext(): void {
  if (!this.selectedChoice) {
    this.showWarning = false;
    this.moveToNextQuestion();
    return;
  }
  this.showWarning = false;
  if (this.selectedChoice !== null && this.examMetaData) {
    const userChoice: UpdateUserQuestionChoice = {
      examId: this.examMetaData.examId,
      examQuestionId: this.userExamQuestions[this.currentQuestionIndex].examQuestionId,
      selectedChoiceId: this.selectedChoice,
      reviewLater: this.markForReview,
    };
    // Save state locally
    const questionStatus = this.questionStatuses.find(
      (qs) => qs.questionId === this.userExamQuestions[this.currentQuestionIndex].questionId
    );
    if (questionStatus) questionStatus.status = 'Answered';
    this.saveCurrentQuestionState();
    // Fire-and-forget the updateUserChoice call
    this.examService.updateUserChoice(userChoice).subscribe({
      error: (error) => {
        console.error('Failed to update user choice:', error);
        this.toastr.error('Failed to save your choice. Please try again.', 'Error');
      },
    });
    // Move to next question immediately
    this.moveToNextQuestion();
  }
}

  private moveToNextQuestion(): void {
    if (this.currentQuestionIndex < this.userExamQuestions.length - 1) {
      this.currentQuestionIndex++;
      this.loadQuestion(this.userExamQuestions[this.currentQuestionIndex].questionId);
    } else {
      this.toastr.info('Exam completed. Submit for evaluation!', 'Exam Completed');
      this.router.navigate(['/exam/feedback'], {
        queryParams: { examId: this.examMetaData?.examId },
      });
    }
  }

  checkReviewStatus(questionId: number): boolean {
    const question = this.userExamQuestions.find((f) => f.questionId === questionId);
    return question?.reviewLater ?? false;
  }

  splitQuestionText(questionText: string): { text: string; isCode: boolean }[] {
    const regex = /```([\s\S]*?)```/g;
    const result: { text: string; isCode: boolean }[] = [];
    let lastIndex = 0;

    questionText.replace(regex, (match, code, index) => {
      if (lastIndex < index) {
        result.push({
          text: questionText.substring(lastIndex, index),
          isCode: false,
        });
      }
      result.push({ text: code, isCode: true });
      lastIndex = index + match.length;
      return match;
    });

    if (lastIndex < questionText.length) {
      result.push({ text: questionText.substring(lastIndex), isCode: false });
    }

    return result;
  }

  isCodeQuestion(questionText: string | undefined): boolean {
    if (!questionText) return false;
    return questionText.includes('<code>') || questionText.includes('```');
  }

  updateSelectedChoiceText(): void {
    const selected = this.currentQuestionDetails?.choices.find(
      (c) => c.choiceId === this.selectedChoice
    );
    this.selectedChoiceText = selected ? selected.choiceText : '';
  }
}