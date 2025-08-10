export interface EnvironmentConfiguration {
  env_name: string;
  production: boolean;
  apiUrl: string;
  entraIdConfig: {
    clientId: string;
    authority: string;
    readScopeUrl: string;
    writeScopeUrl: string;
    scopeUrls: string[];
    redirectUri: string;
    postLogoutRedirectUri: string;
  };
  cacheTimeInMinutes: number;
  authPrompt: string;
  validation: {
    emailPattern: RegExp;
    passwordMinLength: number;
    passwordPattern: RegExp;
  };
  routes: {
    home: string;
    authCallback: string;
  };
  defaults: {
    fallbackEmail: string;
    fallbackName: string;
  };
}