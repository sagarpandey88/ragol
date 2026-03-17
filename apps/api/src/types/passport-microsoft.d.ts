declare module 'passport-microsoft' {
  import { Strategy as PassportStrategy } from 'passport';
  import { Request } from 'express';

  interface Profile {
    id: string;
    displayName?: string;
    emails?: { value: string }[];
  }

  interface Options {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
    tenant?: string;
  }

  type VerifyCallback = (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: Error | null, user?: unknown) => void
  ) => void;

  class Strategy extends PassportStrategy {
    constructor(options: Options, verify: VerifyCallback);
    name: string;
  }
}
