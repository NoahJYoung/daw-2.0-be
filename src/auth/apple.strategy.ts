import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-apple';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('APPLE_CLIENT_ID'),
      teamID: configService.get<string>('APPLE_TEAM_ID'),
      keyID: configService.get<string>('APPLE_KEY_ID'),
      callbackURL: configService.get<string>('APPLE_CALLBACK_URL'),
      privateKeyString: configService.get<string>('APPLE_PRIVATE_KEY'),
      scope: ['email', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    idToken: any,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const userEmail = idToken.email;
    const userName = idToken.name || 'Apple User';
    const user = await this.authService.validateOAuthLogin(
      userEmail,
      userName,
      'APPLE',
    );
    done(null, user);
  }
}
