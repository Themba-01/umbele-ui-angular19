// src/app/claim-utils.ts
import { IdTokenClaims } from '@azure/msal-browser';

export interface Claim {
  claim: string;
  value: string;
  description: string;
}

export const createClaimsTable = (claims: IdTokenClaims): Claim[] => {
  const claimsTable: Claim[] = [];

  Object.keys(claims).forEach((key) => {
    const value = claims[key as keyof IdTokenClaims];
    const formattedValue = Array.isArray(value)
      ? value.join(', ')
      : typeof value === 'number'
      ? changeDateFormat(value)
      : value?.toString() || '';

    switch (key) {
      case 'aud':
        populateClaim(
          key,
          formattedValue,
          "Identifies the intended recipient of the token. In ID tokens, the audience is your app's Application ID, assigned to your app in the Azure portal.",
          claimsTable
        );
        break;
      case 'iss':
        populateClaim(
          key,
          formattedValue,
          'Identifies the issuer, or authorization server that constructs and returns the token. If the token was issued by the v2.0 endpoint, the URI will end in /v2.0.',
          claimsTable
        );
        break;
      case 'iat':
        populateClaim(
          key,
          formattedValue,
          '"Issued At" indicates the timestamp (UNIX timestamp) when the authentication for this user occurred.',
          claimsTable
        );
        break;
      case 'nbf':
        populateClaim(
          key,
          formattedValue,
          'The nbf (not before) claim dictates the time (as UNIX timestamp) before which the JWT must not be accepted for processing.',
          claimsTable
        );
        break;
      case 'exp':
        populateClaim(
          key,
          formattedValue,
          "The exp (expiration time) claim dictates the expiration time (as UNIX timestamp) on or after which the JWT must not be accepted for processing.",
          claimsTable
        );
        break;
      case 'name':
        populateClaim(
          key,
          formattedValue,
          "The name claim provides a human-readable value that identifies the subject of the token. The 'profile' scope is required to receive this claim.",
          claimsTable
        );
        break;
      case 'preferred_username':
        populateClaim(
          key,
          formattedValue,
          'The primary username that represents the user. It could be an email address, phone number, or a generic username without a specified format. The profile scope is required in order to receive this claim.',
          claimsTable
        );
        break;
      case 'nonce':
        populateClaim(
          key,
          formattedValue,
          'The nonce matches the parameter included in the original /authorize request to the IDP.',
          claimsTable
        );
        break;
      case 'oid':
        populateClaim(
          key,
          formattedValue,
          'The oid (user object id) is the only claim that should be used to uniquely identify a user in an Azure AD tenant.',
          claimsTable
        );
        break;
      case 'tid':
        populateClaim(
          key,
          formattedValue,
          'The id of the tenant where this application resides.',
          claimsTable
        );
        break;
      case 'upn':
        populateClaim(
          key,
          formattedValue,
          'upn (user principal name) might be unique amongst the active set of users in a tenant but tend to get reassigned to new employees.',
          claimsTable
        );
        break;
      case 'emails':
        populateClaim(
          key,
          formattedValue,
          'Email addresses associated with the user.',
          claimsTable
        );
        break;
      case 'acct':
        populateClaim(
          key,
          formattedValue,
          'Available as an optional claim, it lets you know what the type of user (homed, guest) is.',
          claimsTable
        );
        break;
      case 'sid':
        populateClaim(
          key,
          formattedValue,
          'Session ID, used for per-session user sign-out.',
          claimsTable
        );
        break;
      case 'sub':
        populateClaim(
          key,
          formattedValue,
          'The principal about which the token asserts information, such as the user of an application.',
          claimsTable
        );
        break;
      case 'ver':
        populateClaim(
          key,
          formattedValue,
          'Version of the token issued by the Microsoft identity platform',
          claimsTable
        );
        break;
      case 'login_hint':
        populateClaim(
          key,
          formattedValue,
          'An opaque, reliable login hint claim.',
          claimsTable
        );
        break;
      case 'idtyp':
        populateClaim(
          key,
          formattedValue,
          'Value is app when the token is an app-only token.',
          claimsTable
        );
        break;
      case 'uti':
      case 'rh':
        break;
      default:
        populateClaim(key, formattedValue, '', claimsTable);
    }
  });

  return claimsTable;
};

const populateClaim = (claim: string, value: string, description: string, claimsTable: Claim[]): void => {
  claimsTable.push({
    claim,
    value,
    description
  });
};

const changeDateFormat = (date: number): string => {
  let dateObj = new Date(date * 1000);
  return `${date} - [${dateObj.toString()}]`;
};