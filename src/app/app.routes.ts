// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DataBindingsComponent } from './components/data-bindings/data-bindings.component';
import { CoursesComponent } from './components/courses/courses.component';
import { AgreementPageComponent } from './components/user-test/agreement-page/agreement-page.component';
import { UserExamsComponent } from './components/user-test/user-exams/user-exams.component';
import { ExamComponent } from './components/user-test/exam/exam.component';
import { GetExamFeedbackAndSubmitComponent } from './components/user-test/get-exam-feedback-and-submit/get-exam-feedback-and-submit.component';
import { ViewResultComponent } from './components/user-test/view-result/view-result.component';
import { VideoListComponent } from './components/video-list/video-list.component';
import { CreateQuestionChoiceComponent } from './components/admin/create-question-choice/create-question-choice.component';
import { QuestionsListComponent } from './components/admin/questions-list/questions-list.component';
import { canActivateGuard } from './guards/login.guard';
import { canActivateAdminGuard } from './guards/admin.guard';
import { UpdateProfileComponent } from './components/users/update-profile/update-profile.component';
import { RegisterComponent } from './components/users/register/register.component';
import { MsalRedirectComponent } from '@azure/msal-angular';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'contact-us',
    loadComponent: () =>
      import('./pages/contact-us/contact-us.component').then((m) => m.ContactUsComponent),
  },
  {
    path: 'courses',
    component: CoursesComponent,
   // canActivate: [canActivateGuard], // Protect /courses
  },
  {
    path: 'data-bindings',
    component: DataBindingsComponent,
  },
  {
    path: 'exam/start',
    component: AgreementPageComponent,
    canActivate: [canActivateGuard],
  },
  {
    path: 'user-exams',
    component: UserExamsComponent,
    canActivate: [canActivateGuard],
  },
  { path: 'user/update-profile', component: UpdateProfileComponent, canActivate: [canActivateGuard] }, // Protect update-profile
  {
    path: 'exam',
    component: ExamComponent,
    canActivate: [canActivateGuard],
  },
  {
    path: 'exam/feedback',
    component: GetExamFeedbackAndSubmitComponent,
    canActivate: [canActivateGuard],
  },
  {
    path: 'exam/view-result',
    component: ViewResultComponent,
    canActivate: [canActivateGuard],
  },
  { path: 'videos', component: VideoListComponent },
  {
    path: 'admin/question/list',
    component: QuestionsListComponent,
    canActivate: [canActivateAdminGuard],
  },
  {
    path: 'admin/question/create',
    component: CreateQuestionChoiceComponent,
    canActivate: [canActivateAdminGuard],
  },
  {
    path: 'admin/question/edit/:id',
    component: CreateQuestionChoiceComponent,
    canActivate: [canActivateAdminGuard],
  },
  { path: 'register', component: RegisterComponent },
  { path: 'auth-callback', component: MsalRedirectComponent }, // Add redirect route
  { path: 'logout-callback', component: HomeComponent },
  { path: 'login-failed', component: HomeComponent }, // For MSAL login failures
  { path: '**', redirectTo: 'home' },
];