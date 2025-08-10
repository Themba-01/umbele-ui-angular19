import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush, // Optimize change detection
})
export class HomeComponent {
  constructor(
    private router: Router,
    private spinner: NgxSpinnerService
  ) {}

  navigateToCourses() {
    this.spinner.show(); // Show spinner during navigation
    // Simulate async navigation (e.g., for resolver or preloading)
    setTimeout(() => {
      this.router.navigate(['/courses']).then(() => {
        this.spinner.hide(); // Hide spinner after navigation
      });
    }, 100); // Small delay to ensure spinner is visible
  }
}