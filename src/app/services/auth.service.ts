import { Inject, Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import {
  MsalService,
  MsalBroadcastService,
  MsalGuardConfiguration,
  MSAL_GUARD_CONFIG,
} from '@azure/msal-angular';
import {
  EventMessage,
  AuthenticationResult,
  EventType,
  RedirectRequest,
  AuthError,
} from '@azure/msal-browser';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { CustomIdTokenClaims } from '../models/custom-id-token-claims';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    public authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private toastr: ToastrService,
    private router: Router,
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration
  ) {}

  setActiveAccountOnInit(getClaims: (claims: CustomIdTokenClaims) => void): void {
    const accounts = this.authService.instance.getAllAccounts();
    if (accounts.length > 0 && !this.authService.instance.getActiveAccount()) {
      this.authService.instance.setActiveAccount(accounts[0]);
      getClaims(accounts[0].idTokenClaims as CustomIdTokenClaims);
    }
  }

  subscribeToLoginEvents(getClaims: (claims: CustomIdTokenClaims) => void): void {
    this.msalBroadcastService.msalSubject$.subscribe((event: EventMessage) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        const payload = event.payload as AuthenticationResult;
        if (payload.account) {
          this.authService.instance.setActiveAccount(payload.account);
          getClaims(payload.idTokenClaims as CustomIdTokenClaims);
        }
      }
    });
  }

  async login(userFlowRequest?: RedirectRequest, isLoginInProgress?: { value: boolean }): Promise<void> {
    // Clear only msal.interaction.status to prevent interaction_in_progress error
    sessionStorage.removeItem('msal.interaction.status');

    if (isLoginInProgress?.value) {
      this.toastr.warning('Login in progress. Please wait.', 'Warning');
      return;
    }

    try {
      if (isLoginInProgress) {
        isLoginInProgress.value = true;
      }
      await this.authService.loginRedirect({
        scopes: environment.entraIdConfig.scopeUrls,
        redirectUri: environment.entraIdConfig.redirectUri,
        prompt: environment.authPrompt,
        ...userFlowRequest,
      });
    } catch (err: unknown) {
      const error = err instanceof AuthError ? err : { errorCode: 'Unknown error', errorMessage: String(err) };
      this.toastr.error(`Login failed: ${error.errorCode}. Check console.`, 'Error');
      throw err;
    } finally {
      if (isLoginInProgress) {
        isLoginInProgress.value = false;
      }
    }
  }

  handleRedirectPromise(
    getClaims: (claims: CustomIdTokenClaims) => void,
    syncUserProfile: (claims: CustomIdTokenClaims, adObjId: string, accessToken?: string) => Observable<any>,
    setLoginState: (isLoggedIn: boolean, loginDisplay: boolean) => void
  ): Observable<any> {
    return from(this.authService.instance.handleRedirectPromise()).pipe(
      switchMap((response: AuthenticationResult | null) => {
        if (response && response.account && response.idTokenClaims) {
          this.authService.instance.setActiveAccount(response.account);
          setLoginState(true, true);
          getClaims(response.idTokenClaims as CustomIdTokenClaims);
          this.toastr.success('Login successful via redirect!', 'Success');
          const userIdClaim = (response.idTokenClaims as CustomIdTokenClaims).oid || (response.idTokenClaims as CustomIdTokenClaims).sub;
          if (userIdClaim) {
            return syncUserProfile(response.idTokenClaims as CustomIdTokenClaims, userIdClaim, response.accessToken).pipe(
              tap(() => {
                const intendedUrl = localStorage.getItem('intendedUrl') || environment.routes.home;
                localStorage.removeItem('intendedUrl');
                this.router.navigateByUrl(intendedUrl);
              })
            );
          }
          const intendedUrl = localStorage.getItem('intendedUrl') || environment.routes.home;
          localStorage.removeItem('intendedUrl');
          this.router.navigateByUrl(intendedUrl);
          return from(Promise.resolve(response));
        } else {
          const account = this.authService.instance.getAllAccounts()[0];
          if (account && account.idTokenClaims) {
            this.authService.instance.setActiveAccount(account);
            setLoginState(true, true);
            getClaims(account.idTokenClaims as CustomIdTokenClaims);
            const userIdClaim = (account.idTokenClaims as CustomIdTokenClaims).oid || (account.idTokenClaims as CustomIdTokenClaims).sub;
            if (userIdClaim) {
              return syncUserProfile(account.idTokenClaims as CustomIdTokenClaims, userIdClaim, undefined).pipe(
                tap(() => {
                  const intendedUrl = localStorage.getItem('intendedUrl') || environment.routes.home;
                  localStorage.removeItem('intendedUrl');
                  this.router.navigateByUrl(intendedUrl);
                })
              );
            }
            const intendedUrl = localStorage.getItem('intendedUrl') || environment.routes.home;
            localStorage.removeItem('intendedUrl');
            this.router.navigateByUrl(intendedUrl);
            return from(Promise.resolve({ account }));
          } else {
            this.toastr.warning('Authentication required. Please log in.', 'Warning');
            this.login(undefined, undefined);
            return from(Promise.resolve(null));
          }
        }
      }),
      catchError((err: unknown) => {
        const error = err instanceof AuthError ? err : { errorCode: 'Unknown error', errorMessage: String(err) };
        this.toastr.error(`Authentication failed: ${error.errorCode}. Please try again.`, 'Error');
        this.login(undefined, undefined);
        return throwError(() => err);
      })
    );
  }

  async getToken(getClaims: (claims: CustomIdTokenClaims) => void): Promise<string | null> {
    try {
      const accounts = this.authService.instance.getAllAccounts();
      if (!accounts || accounts.length === 0) {
        this.toastr.warning('No accounts available. Initiating login.', 'Warning');
        await this.login(undefined, undefined);
        return null;
      }
      const account = accounts[0];
      const response: AuthenticationResult = await this.authService.instance.acquireTokenSilent({
        scopes: environment.entraIdConfig.scopeUrls,
        account: account,
        redirectUri: environment.entraIdConfig.redirectUri,
      });
      if (response.idTokenClaims) {
        this.authService.instance.setActiveAccount(account);
        getClaims(response.idTokenClaims as CustomIdTokenClaims);
      }
      return response.accessToken;
    } catch (err: unknown) {
      const error = err instanceof AuthError ? err : { errorCode: 'Unknown error', errorMessage: String(err) };
      this.toastr.error(`Session expired: ${error.errorCode}. Please log in again.`, 'Error');
      await this.login(undefined, undefined);
      return null;
    }
  }

  logout(): void {
    const activeAccount = this.authService.instance.getActiveAccount() || this.authService.instance.getAllAccounts()[0];
    // Clear all session and local storage to ensure clean state
    sessionStorage.clear();
    localStorage.removeItem('intendedUrl');
    this.authService.instance.clearCache();
    if (activeAccount) {
      this.authService.instance.setActiveAccount(null);
    }
    // Perform logout with minimal parameters
    this.authService.logoutRedirect({
      account: activeAccount,
      postLogoutRedirectUri: environment.entraIdConfig.postLogoutRedirectUri,
    });
    this.toastr.info('Logged out successfully.', 'Info');
  }
}