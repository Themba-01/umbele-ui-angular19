import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService, IndividualConfig } from 'ngx-toastr';
import { ExamFeedback } from '../../../models/exam-models';
import { ExamService } from '../../../services/exam.service';
import { ExamDetailsComponent } from "../exam-details/exam-details.component";

@Component({
  selector: 'app-view-result',
  imports: [ExamDetailsComponent],
  templateUrl: './view-result.component.html',
  styleUrl: './view-result.component.css'
})
export class ViewResultComponent {
  examId: number = 0;
  showCertificate = false;

  constructor(
    private route: ActivatedRoute
  ) {
    // Get examId from query parameters
    this.route.queryParams.subscribe((params) => {
      this.examId = params['examId'];
    });
  }

}
