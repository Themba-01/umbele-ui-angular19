import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './auth.service';
import { UserProfileService } from './user-profile.service';
import { Claim } from '../claim-utils';
import { CustomIdTokenClaims } from '../models/custom-id-token-claims';
import { RedirectRequest } from '@azure/msal-browser';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private claimsSubject = new BehaviorSubject<Claim[]>([]);
  claims$ = this.claimsSubject.asObservable().pipe(distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)));
  private userIdSubject = new BehaviorSubject<number>(0);
  userId$ = this.userIdSubject.asObservable().pipe(distinctUntilChanged());
  loginDisplay = false;
  isLoggedIn = false;
  userName: string = '';
  userId: number = 0;
  userRoles: string[] = [];
  private lastSyncedAdObjId: string | null = null;
  private isLoginInProgress = false;

  constructor(
    public authService: AuthService, // Made public for login.guard.ts
    private userProfileService: UserProfileService,
    private router: Router,
    private toastr: ToastrService
  ) {
    const storedUserId = sessionStorage.getItem('userId');
    if (storedUserId && +storedUserId > 0) {
      this.userId = +storedUserId;
      this.userIdSubject.next(this.userId);
    }

    this.authService.setActiveAccountOnInit(this.getClaims.bind(this));
    this.authService.subscribeToLoginEvents(this.getClaims.bind(this));
  }

  login(userFlowRequest?: RedirectRequest): Promise<void> {
    return this.authService.login(userFlowRequest, { value: this.isLoginInProgress });
  }

  handleRedirectPromise(): Observable<any> {
    return this.authService.handleRedirectPromise(
      this.getClaims.bind(this),
      (claims: CustomIdTokenClaims, adObjId: string, accessToken?: string) =>
        this.userProfileService.syncUserProfile(claims, adObjId, () => this.authService.getToken(this.getClaims.bind(this)), accessToken),
      this.setLoginState.bind(this)
    );
  }

  getToken(): Promise<string | null> {
    return this.authService.getToken(this.getClaims.bind(this));
  }

  logout(): void {
    // Clear all session storage to remove MSAL-related keys
    sessionStorage.clear();
    this.userId = 0;
    this.userIdSubject.next(0);
    this.claimsSubject.next([]);
    this.userRoles = [];
    this.userName = '';
    this.lastSyncedAdObjId = null;
    this.isLoggedIn = false;
    this.loginDisplay = false;
    this.authService.logout();
  }

  getClaims(claims: CustomIdTokenClaims): void {
    const userIdClaim = this.userProfileService.getClaims(
      claims,
      this.updateUserState.bind(this),
      this.userProfileService.syncUserProfile.bind(this.userProfileService),
      this.authService.getToken.bind(this.authService, this.getClaims.bind(this)),
      this.lastSyncedAdObjId
    );
    if (userIdClaim) {
      this.lastSyncedAdObjId = userIdClaim;
    }
  }

  private updateUserState(userId: number, userName: string, userRoles: string[], claimsTable: Claim[]): void {
    this.userId = userId;
    this.userIdSubject.next(userId);
    if (userId > 0) {
      sessionStorage.setItem('userId', userId.toString());
    } else {
      sessionStorage.setItem('userId', '0');
    }
    this.userName = userName;
    this.userRoles = userRoles;
    this.claimsSubject.next(claimsTable);
    this.setLoginDisplay();
  }

  private setLoginState(isLoggedIn: boolean, loginDisplay: boolean): void {
    this.isLoggedIn = isLoggedIn;
    this.loginDisplay = loginDisplay;
  }

  private setLoginDisplay(): void {
    this.loginDisplay = this.authService.authService.instance.getAllAccounts().length > 0;
    this.isLoggedIn = this.loginDisplay && this.userId > 0;
  }

  isAuthenticated(): boolean {
    return this.loginDisplay && this.userId > 0;
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.userId$.pipe(
      map((userId) => this.loginDisplay && userId > 0)
    );
  }
}