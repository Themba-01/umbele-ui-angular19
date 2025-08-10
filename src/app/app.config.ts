import {
  IPublicClientApplication,
  PublicClientApplication,
  InteractionType,
  BrowserCacheLocation,
  LogLevel,
} from '@azure/msal-browser';
import {
  MsalInterceptor,
  MsalService,
  MsalBroadcastService,
  MsalRedirectComponent,
  MSAL_INSTANCE,
  MsalInterceptorConfiguration,
  MsalGuardConfiguration,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
} from '@azure/msal-angular';
import { environment } from '../environments/environment';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
  APP_INITIALIZER,
} from '@angular/core';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  withFetch,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpRequestInterceptor } from './services/spinner-interceptor';
import { provideRouter } from '@angular/router';
import { HttpErrorInterceptor } from './interceptors/http-error.service';
import { routes } from './app.routes';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { RatingModule } from 'ngx-bootstrap/rating';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { CarouselModule } from 'ngx-bootstrap/carousel';

export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(`MSAL Config: ${message}`);
}

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.entraIdConfig.clientId,
      authority: environment.entraIdConfig.authority,
      knownAuthorities: ['smartcertifyexternalid.ciamlogin.com'],
      redirectUri: environment.entraIdConfig.redirectUri,
      postLogoutRedirectUri: environment.entraIdConfig.postLogoutRedirectUri,
      navigateToLoginRequestUrl: false,
    },
    cache: {
      cacheLocation: BrowserCacheLocation.SessionStorage,
    },
    system: {
      allowNativeBroker: false,
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Verbose,
        piiLoggingEnabled: true,
      },
    },
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string> | null>();
  protectedResourceMap.set(`${environment.apiUrl}/User/register`, null);
  protectedResourceMap.set(`${environment.apiUrl}/courses`, null);
  const protectedEndpoints = [
    `${environment.apiUrl}/User/sync`,
    `${environment.apiUrl}/User/updateProfile`,
    `${environment.apiUrl}/User/generate-sas`,
    `${environment.apiUrl}/User/users-with-email`,
    `${environment.apiUrl}/User`,
    `${environment.apiUrl}/exam/*`,
    `${environment.apiUrl}/questions/*`,
  ];
  protectedEndpoints.forEach((endpoint) => {
    protectedResourceMap.set(endpoint, environment.entraIdConfig.scopeUrls);
  });
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: environment.entraIdConfig.scopeUrls,
      prompt: 'select_account',
    },
    loginFailedRoute: '/login-failed',
  };
}

export function initializeMsal(msalService: MsalService) {
  return () => {
    // Skip MSAL initialization during Azure AD logout redirect
    if (
      window.location.href.includes('smartcertifyexternalid.ciamlogin.com') ||
      window.location.search.includes('logoutId')
    ) {
      return Promise.resolve();
    }
    return msalService.instance
      .initialize()
      .then(() => {
        console.log('MSAL initialized successfully');
        sessionStorage.setItem('msalInitialized', 'true');
      })
      .catch((err) => {
        console.error('MSAL initialization failed:', err);
        throw err;
      });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      CarouselModule.forRoot(),
      AccordionModule.forRoot(),
      RatingModule.forRoot(),
      ModalModule.forRoot(),
      PopoverModule.forRoot(),
      BrowserModule,
      BrowserAnimationsModule,
      ToastrModule.forRoot({
        timeOut: 3000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
      }),
      NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' })
    ),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true },
    { provide: MSAL_INSTANCE, useFactory: MSALInstanceFactory },
    { provide: MSAL_GUARD_CONFIG, useFactory: MSALGuardConfigFactory },
    { provide: MSAL_INTERCEPTOR_CONFIG, useFactory: MSALInterceptorConfigFactory },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeMsal,
      deps: [MsalService],
      multi: true,
    },
    MsalService,
    MsalBroadcastService,
    MsalRedirectComponent,
    provideAnimationsAsync(),
  ],
};