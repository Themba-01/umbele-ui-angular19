import { EnvironmentConfiguration } from "../app/models/environment-configuration";

export const environment: EnvironmentConfiguration = {
  env_name: 'dev',
  production: false,
  apiUrl: 'https://localhost:7209/api',
  entraIdConfig: {
    clientId: '9aa93c61-03b6-4c19-82c1-644224a3e550',
    authority: 'https://smartcertifyexternalid.ciamlogin.com/903995e5-4dc5-43e2-b158-c04c830baaf2/v2.0/',
    readScopeUrl: 'api://d87e1acf-e398-4de8-9adf-d2dfacd0785b/User.Read',
    writeScopeUrl: 'api://d87e1acf-e398-4de8-9adf-d2dfacd0785b/User.Write',
    scopeUrls: [
      'api://d87e1acf-e398-4de8-9adf-d2dfacd0785b/.default',
      'openid',
      'profile',
      'offline_access'
    ],
    redirectUri: 'http://localhost:4200/auth-callback',
    postLogoutRedirectUri: 'http://localhost:4200'
  },
  cacheTimeInMinutes: 30,
  authPrompt: 'select_account',
  validation: {
    emailPattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    passwordMinLength: 8,
    passwordPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#()])[A-Za-z\d@$!%*?&#()]{8,}$/
  },
  routes: {
    home: 'home',
    authCallback: 'auth-callback'
  },
  defaults: {
    fallbackEmail: 'unknown@example.com',
    fallbackName: 'Unknown'
  }
};