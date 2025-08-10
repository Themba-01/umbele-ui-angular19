import { Injectable } from '@angular/core';
import { Observable, from, throwError, of } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { createClaimsTable, Claim } from '../claim-utils';
import { environment } from '../../environments/environment';
import { UserModel } from '../models/usermodel';
import { CustomIdTokenClaims } from '../models/custom-id-token-claims';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private baseUrl = `${environment.apiUrl}/User`;
  private userCache = new Map<number, UserModel>();

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  getUserProfile(id: number): Observable<UserModel> {
    const cachedUser = this.userCache.get(id);
    if (cachedUser) {
      return of(cachedUser);
    }
    return this.http.get<UserModel>(`${this.baseUrl}/${id}`).pipe(
      tap((user) => this.userCache.set(id, user))
    );
  }

  updateProfile(formData: FormData): Observable<any> {
    const userId = formData.get('userId') as string;
    if (userId) {
      this.userCache.delete(+userId);
    }
    return this.http.post(`${this.baseUrl}/updateProfile`, formData);
  }

  register(userData: {
    displayName: string;
    givenName: string;
    surname: string;
    userPrincipalName: string;
    mail: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData);
  }

  clearCache(userId?: number) {
    if (userId) {
      this.userCache.delete(userId);
    } else {
      this.userCache.clear();
    }
  }

  syncUserProfile(claims: CustomIdTokenClaims, adObjId: string, getToken: () => Promise<string | null>, accessToken?: string): Observable<any> {
    const email = claims.emails?.[0] || claims.preferred_username || environment.defaults.fallbackEmail;
    const firstName = claims.given_name || claims.name?.split(' ')[0] || environment.defaults.fallbackName;
    const lastName = claims.family_name || claims.name?.split(' ')[1] || environment.defaults.fallbackName;
    const displayName = claims.name || `${firstName} ${lastName}`;

    const userProfile: UserModel = {
      userId: 0,
      displayName: displayName,
      firstName: firstName,
      lastName: lastName,
      email: email,
      adObjId: adObjId,
    };

    return from(getToken()).pipe(
      switchMap((token) => {
        if (!token) {
          this.toastr.error('Failed to acquire access token. Please log in again.', 'Error');
          return throwError(() => new Error('No access token available'));
        }
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        });
        return this.http.post(`${this.baseUrl}/sync`, userProfile, { headers }).pipe(
          tap((response: any) => {
            if (response && response.userId) {
              this.userCache.set(response.userId, { ...userProfile, userId: response.userId });
            }
          }),
          catchError((error) => {
            this.toastr.error(`Failed to sync user profile: ${error.statusText || 'Unknown error'}`, 'Error');
            return throwError(() => error);
          })
        );
      })
    );
  }

  getClaims(
    claims: CustomIdTokenClaims,
    updateUserState: (userId: number, userName: string, userRoles: string[], claimsTable: Claim[]) => void,
    syncUserProfile: (claims: CustomIdTokenClaims, adObjId: string, getToken: () => Promise<string | null>, accessToken?: string) => Observable<any>,
    getToken: () => Promise<string | null>,
    lastSyncedAdObjId: string | null
  ): string | null {
    if (claims) {
      const claimsTable: Claim[] = createClaimsTable(claims);
      const userIdClaim: string | null = claims.oid || claims.sub || null;
      if (userIdClaim && userIdClaim !== lastSyncedAdObjId) {
        from(getToken()).pipe(
          switchMap((token) => {
            if (!token) {
              this.toastr.error('Failed to acquire access token. Please log in again.', 'Error');
              return throwError(() => new Error('No access token available'));
            }
            return syncUserProfile(claims, userIdClaim, getToken, token);
          })
        ).subscribe({
          next: (response: any) => {
            if (response && response.userId) {
              const givenName = claims.given_name || claims.name?.split(' ')[0] || environment.defaults.fallbackName;
              const familyName = claims.family_name || claims.name?.split(' ')[1] || environment.defaults.fallbackName;
              const userName = claims.name || `${givenName} ${familyName}`;
              updateUserState(response.userId, userName, [], claimsTable);
              this.toastr.success('User profile synced.', 'Success');
            }
          },
          error: (err: any) => {
            this.toastr.error(`Failed to sync user profile: ${err.status} ${err.statusText}`, 'Error');
            updateUserState(0, '', [], []);
          },
        });
        return userIdClaim;
      }
      const givenName = claims.given_name || claims.name?.split(' ')[0] || environment.defaults.fallbackName;
      const familyName = claims.family_name || claims.name?.split(' ')[1] || environment.defaults.fallbackName;
      const userName = claims.name || `${givenName} ${familyName}`;
      updateUserState(0, userName, [], claimsTable);
      return userIdClaim;
    } else {
      this.toastr.warning('No claims available. Please log in again.', 'Warning');
      updateUserState(0, '', [], []);
      return null;
    }
  }
}