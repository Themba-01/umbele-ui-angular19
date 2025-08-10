import { IdTokenClaims } from '@azure/msal-browser';

export interface CustomIdTokenClaims extends IdTokenClaims {
  given_name?: string;
  family_name?: string;
  emails?: string[];
  name?: string;
  preferred_username?: string;
  oid?: string;
  sub?: string;
}