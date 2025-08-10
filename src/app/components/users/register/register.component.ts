import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { RouterModule, Router } from '@angular/router';
import { UserProfileService } from '../../../services/user-profile.service';
import { LoginService } from '../../../services/login.service';
import { PopupRequest } from '@azure/msal-browser';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  private baseUrl = `${environment.apiUrl}/User`;

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private loginService: LoginService,
    private toastrService: ToastrService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      displayName: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(environment.validation.emailPattern)
      ]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(environment.validation.passwordMinLength),
          Validators.pattern(environment.validation.passwordPattern)
        ]
      ]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.toastrService.error('Please fill all required fields correctly');
      return;
    }

    const userData = {
      displayName: this.registerForm.value.displayName,
      givenName: this.registerForm.value.firstName,
      surname: this.registerForm.value.lastName,
      userPrincipalName: this.registerForm.value.email,
      mail: this.registerForm.value.email,
      password: this.registerForm.value.password,
      accountEnabled: true,
      forceChangePasswordNextSignIn: false
    };

    this.userProfileService.register(userData).subscribe({
      next: (response: any) => {
        this.toastrService.success('Registration successful! Logging you in...');
        this.registerForm.reset();

        const authRequest: PopupRequest = {
          scopes: environment.entraIdConfig.scopeUrls,
          authority: environment.entraIdConfig.authority,
          loginHint: userData.userPrincipalName,
          prompt: environment.authPrompt
        };

        this.loginService.login(authRequest).then(() => {
          this.toastrService.success('Login successful!');
          this.router.navigateByUrl(environment.routes.authCallback);
        }).catch(() => {
          this.toastrService.error('Login failed. Please try logging in manually.');
          this.router.navigateByUrl(environment.routes.home);
        });
      },
      error: (error) => {
        this.toastrService.error(error.error?.error || error.error?.details || 'Failed to register');
      }
    });
  }
}