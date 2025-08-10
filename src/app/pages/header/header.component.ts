import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  MSAL_GUARD_CONFIG,
  MsalGuardConfiguration,
  MsalService,
  MsalBroadcastService,
} from '@azure/msal-angular';
import { InteractionStatus, EventMessage, EventType } from '@azure/msal-browser';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Claim } from '../../models/claim';
import { LoginService } from '../../services/login.service';
import { UserProfileService } from '../../services/user-profile.service';
import { SearchService } from '../../services/search.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isIframe = false;
  loginDisplay = false;
  isAdmin = false;
  userName = '';
  userId = 0;
  private readonly _destroying$ = new Subject<void>();
  claims: Claim[] = [];
  profilePictureUrl = '';
  searchForm: FormGroup;

  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private loginService: LoginService,
    private router: Router,
    private userService: UserProfileService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private searchService: SearchService
  ) {
    this.searchForm = this.fb.group({
      searchQuery: [''],
    });
  }

  async login() {
    try {
      await this.loginService.login();
      console.log('Initiated login redirect');
    } catch (error) {
      console.error('Login error:', error);
      this.toastrService.error('Login failed. Please try again.', 'Error');
    }
  }

  logout() {
    this.loginService.logout();
  }

  onForgotPassword() {
    this.toastrService.info(
      'Self-service password reset is not available in Entra ID Free. Contact your administrator to reset your password via the Azure Portal.'
    );
  }

  getUserInfo() {
    if (this.loginService.userId && this.loginService.userId > 0) {
      this.userService.getUserProfile(this.loginService.userId).subscribe({
        next: (s) => {
          this.profilePictureUrl = s.profileImageUrl ? s.profileImageUrl : '';
        },
        error: () => {
          this.toastrService.error('Failed to fetch user profile.', 'Error');
        },
      });
    }
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  checkAndSetActiveAccount() {
    let activeAccount = this.authService.instance.getActiveAccount();
    if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
      let accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
    }
  }

  onSearch() {
    const query = this.searchForm.get('searchQuery')?.value?.trim() || '';
    this.searchService.setSearchQuery(query);
    // Navigate to courses page if not already there
    if (this.router.url !== '/courses') {
      this.router.navigate(['/courses']);
    }
  }

  ngOnInit(): void {
    console.log('HeaderComponent ngOnInit');
    this.loginService.claims$.subscribe((s) => {
      this.claims = s;
      const roles = s.filter((f) => f.claim === 'extension_userRoles');
      this.getUserInfo();
      setInterval(() => {
        this.getUserInfo();
      }, 30000);
      if (roles.length && !this.isAdmin) {
        this.isAdmin = roles[0].value.split(',').filter((f) => f === 'Admin').length > 0;
      }
      const givenName = s.find((c) => c.claim === 'given_name')?.value || 'Unknown';
      const familyName = s.find((c) => c.claim === 'family_name')?.value || 'Unknown';
      this.userName = s.find((c) => c.claim === 'name')?.value || `${givenName} ${familyName}`;
    });

    this.loginService.userId$.subscribe((id) => {
      this.userId = id;
    });

    this.isIframe = window !== window.parent && !window.opener;
    this.setLoginDisplay();

    this.authService.instance.enableAccountStorageEvents();
    this.msalBroadcastService.msalSubject$
      .pipe(takeUntil(this._destroying$))
      .subscribe({
        next: (msg: EventMessage) => {
          if (msg.eventType === EventType.ACCOUNT_ADDED || msg.eventType === EventType.ACCOUNT_REMOVED) {
            if (this.authService.instance.getAllAccounts().length === 0) {
              this.router.navigate(['/']);
            } else {
              this.setLoginDisplay();
            }
          }
        },
        error: () => {
          this.toastrService.error('Account event error.', 'Error');
        },
      });

    this.msalBroadcastService.inProgress$
      .pipe(takeUntil(this._destroying$))
      .subscribe({
        next: (status: InteractionStatus) => {
          if (status === InteractionStatus.None) {
            this.setLoginDisplay();
            this.checkAndSetActiveAccount();
          }
        },
        error: () => {
          this.toastrService.error('Session initialization failed.', 'Error');
        },
      });
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}