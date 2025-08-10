import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Course } from '../../models/course';
import { CoursesService } from '../../services/courses.service';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { TechFilterComponent } from '../tech-filter/tech-filter.component';
import { ToastrService } from 'ngx-toastr';
import { SearchService } from '../../services/search.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, TechFilterComponent],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css'],
})
export class CoursesComponent implements OnInit, OnDestroy {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  onlyAvailableTest = false;
  userId: number = 0;
  technologySelected: string = ''; // Default to first tech
  searchQuery: string = '';
  techData = [
    { name: 'Life Sciences', image: '../../../assets/technologies/life-sciences.svg' },
    { name: 'Life Sciences Grade 11', image: '../../../assets/technologies/react.svg' },
    { name: 'Life Sciences Grade 12', image: '../../../assets/technologies/azure.svg' },
    { name: 'Physical Sciences Grade 10', image: '../../../assets/technologies/dotnet-core.svg' },
    { name: 'Physical Sciences Grade 11', image: '../../../assets/technologies/javascript.svg' },
    { name: 'Physical Sciences Grade 12', image: '../../../assets/technologies/java.svg' },
    { name: 'Mathematics Grade 10', image: '../../../assets/technologies/sql.svg' },
    { name: 'Mathematics Grade 11', image: '../../../assets/technologies/react-native.svg' },
    { name: 'Mathematics Grade 12', image: '../../../assets/technologies/aws.svg' },
    { name: 'Accounting', image: '../../../assets/technologies/docker.svg' },
  ];
  private destroy$ = new Subject<void>();

  constructor(
    private courseService: CoursesService,
    private router: Router,
    private loginService: LoginService,
    private toastr: ToastrService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    if (this.loginService.isAuthenticated()) {
      this.userId = this.loginService.userId;
    }
    this.searchService.searchQuery$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((query) => {
        this.searchQuery = query;
        this.applyFilters();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTechSelected(tech: string): void {
    console.log(`${tech} selected`);
    this.technologySelected = tech;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.courses;

    // Apply technology filter
    if (this.technologySelected) {
      filtered = filtered.filter((course) =>
        course.title.toLowerCase().startsWith(this.technologySelected.toLowerCase())
      );
    }

    // Apply search query filter
    if (this.searchQuery) {
      filtered = filtered.filter((course) =>
        course.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    // Apply availability filter
    if (this.onlyAvailableTest) {
      filtered = filtered.filter((course) => course.questionsAvailable);
    }

    this.filteredCourses = filtered;
  }

  getCoursesForTech(tech: string): Course[] {
    return this.courses.filter((course) =>
      course.title.toLowerCase().startsWith(tech.toLowerCase())
    );
  }

  filterAvailableTests() {
    this.applyFilters();
  }

  loadCourses(): void {
    this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error loading courses:', err);
        this.toastr.error('Failed to load courses. Please try again.', 'Error');
      },
    });
  }

  startTest(courseId: number): void {
    console.log(`Start test for course ID: ${courseId}`);
    if (!this.loginService.isAuthenticated()) {
      this.toastr.info('Please log in to start a test.', 'Login Required');
      localStorage.setItem('intendedUrl', `/exam/start`);
      this.loginService.login();
      return;
    }
    sessionStorage.setItem('userId', this.userId.toString());
    sessionStorage.setItem('courseId', courseId.toString());
    this.router.navigate(['/exam/start']);
  }
}