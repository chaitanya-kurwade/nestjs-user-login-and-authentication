import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from 'apps/auth/src/auth.service';
import { Strategy } from 'passport-google-oauth20';
import { VerifiedCallback } from 'passport-jwt';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    email: string,
    profile: any,
    done: VerifiedCallback,
  ): Promise<any> {
    const { id, name, emails } = profile;

    const user = {
      provider: 'google',
      providerId: id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
    };
    done(null, user);
  }
  // http://localhost:3000/auth/google/callback
  /**
   * 
   * {
  id: '116286825871106321899',
  displayName: 'Chaitanya K',
  name: { familyName: 'K', givenName: 'Chaitanya' },
  emails: [ { value: 'chaitanyakurwade1234@gmail.com', verified: true } ],
  photos: [
    {
      value: 'https://lh3.googleusercontent.com/a/ACg8ocLxbeszJ-v84PnGX25bV86VrPgk2YsFZ3-oFtFq9zC4=s96-c'
    }
  ],
  provider: 'google',
  _raw: '{\n' +
    '  "sub": "116286825871106321899",\n' +    
    '  "name": "Chaitanya K",\n' +
    '  "given_name": "Chaitanya",\n' +
    '  "family_name": "K",\n' +
    '  "picture": "https://lh3.googleusercontent.com/a/ACg8ocLxbeszJ-v84PnGX25bV86VrPgk2YsFZ3-oFtFq9zC4\\u003ds96-c",\n' +
    '  "email": "chaitanyakurwade1234@gmail.com",\n' +
    '  "email_verified": true,\n' +
    '  "locale": "en"\n' +
    '}',
  _json: {
    sub: '116286825871106321899',
    name: 'Chaitanya K',
    given_name: 'Chaitanya',
    family_name: 'K',
    picture: 'https://lh3.googleusercontent.com/a/ACg8ocLxbeszJ-v84PnGX25bV86VrPgk2YsFZ3-oFtFq9zC4=s96-c',
    email: 'chaitanyakurwade1234@gmail.com',   
    email_verified: true,
    locale: 'en'
  }
   * 
  */
}
