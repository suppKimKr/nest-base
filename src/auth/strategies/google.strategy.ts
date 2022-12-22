import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { SocialUserDto } from 'src/user/dto/social-user.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  'google')
{
    constructor(
        private readonly configService: ConfigService
    ){
        super({
            clientID: configService.get('GOOGLE_CLIENT_ID'),
            clientSecret: configService.get('GOOGLE_CLIENT_SECRET_PW'),
            callbackURL: configService.get('GOOGLE_CALLBACK'),
            scope:['email', 'profile'],
        })
    }
    
    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const { name, emails } = profile;
        const user: SocialUserDto = {
            id: profile.getId(),
            email: emails[0].value,
            name: name.givenName + name.failyName,
            accessToken,
            refreshToken,
        };

        done(null, user);
    }
}

