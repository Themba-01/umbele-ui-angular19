import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../../services/login.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { UserProfileService } from '../../../services/user-profile.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-update-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './update-profile.component.html',
  styleUrl: './update-profile.component.css',
})
export class UpdateProfileComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  selectedFile!: File;
  previewUrl: string | ArrayBuffer | null = null;
  isInstructor = false;
  userProfileId = 0;
  private destroy$ = new Subject<void>();
  backgroundImage: string = '/assets/technologies/angularss.svg';

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private loginService: LoginService,
    private toastrService: ToastrService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      bio: [{ value: '', disabled: true }],
    });
  }

  ngOnInit(): void {
    if (!this.loginService.isLoggedIn) {
      this.router.navigateByUrl('/home');
      return;
    }

    this.loginService.userId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((id) => {
        this.userProfileId = id;
        if (id > 0) {
          this.userProfileService.getUserProfile(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
              (response) => {
                this.profileForm.patchValue({
                  bio: response.bio || '',
                });
                if (response.profileImageUrl) {
                  this.previewUrl = response.profileImageUrl;
                }
              },
              (error) => {
                this.toastrService.error('Error fetching user profile');
              }
            );
        }
      });

    if (this.isInstructor) {
      this.profileForm.get('bio')?.enable();
    } else {
      this.profileForm.get('bio')?.clearValidators();
      this.profileForm.get('bio')?.updateValueAndValidity();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result;
    };
    reader.readAsDataURL(this.selectedFile);
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('userId', this.userProfileId.toString());
    formData.append('picture', this.selectedFile);

    this.userProfileService.updateProfile(formData).subscribe(
      (response) => {
        this.toastrService.success('Profile updated successfully');
      },
      (error) => {
        this.toastrService.error('Error updating profile');
      }
    );
  }
}