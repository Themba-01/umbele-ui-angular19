import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../services/login.service';
import { Observable, of, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

export const canActivateGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> | boolean | UrlTree => {
  const loginService = inject(LoginService);
  const toastrService = inject(ToastrService);
  const router = inject(Router);

  console.log('Guard: Checking authentication for:', state.url);

  if (loginService.isAuthenticated()) {
    console.log('Guard: User is authenticated, allowing navigation to:', state.url);
    return of(true);
  }

  const account = loginService.authService.authService.instance.getActiveAccount();
  if (account) {
    console.log('Guard: Active account found, attempting silent token acquisition.');
    return from(loginService.getToken()).pipe(
      switchMap((token) => {
        if (token) {
          console.log('Guard: Silent token acquired, allowing navigation to:', state.url);
          loginService.isLoggedIn = true;
          return of(true);
        }
        console.log('Guard: Silent token acquisition failed, redirecting to login.');
        toastrService.info('Session expired. Please log in again.', 'Login Required');
        localStorage.setItem('intendedUrl', state.url);
        loginService.login();
        return of(router.parseUrl('/home'));
      }),
      catchError((err) => {
        console.error('Guard: Silent token acquisition error:', err);
        toastrService.info('Session expired. Please log in again.', 'Login Required');
        localStorage.setItem('intendedUrl', state.url);
        loginService.login();
        return of(router.parseUrl('/home'));
      })
    );
  }

  console.log('Guard: No active account, checking redirect promise.');
  return loginService.handleRedirectPromise().pipe(
    switchMap((result) => {
      if (loginService.isAuthenticated()) {
        console.log('Guard: User authenticated after redirect, allowing navigation to:', state.url);
        return of(true);
      }
      console.log('Guard: No userId after redirect, redirecting to login.');
      toastrService.info('You need to log in to access this feature.', 'Login Required');
      localStorage.setItem('intendedUrl', state.url);
      loginService.login();
      return of(router.parseUrl('/home'));
    }),
    catchError((err) => {
      console.error('Guard: Redirect promise error:', err);
      toastrService.info('Authentication failed. Please try again.', 'Error');
      localStorage.setItem('intendedUrl', state.url);
      loginService.login();
      return of(router.parseUrl('/home'));
    })
  );
};