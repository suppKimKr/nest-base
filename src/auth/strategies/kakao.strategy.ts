import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-kakao";
import { SocialUserDto } from "../../user/dto/social-user.dto";

@Injectable()
export class KakaoStrategy extends PassportStrategy(
  Strategy,
  'kakao'
) {
    constructor(
        private readonly configService: ConfigService
    ) {
        super({
            clientID: configService.get('KAKAO_API_KEY'),
            callbackURL: configService.get('KAKAO_REDIRECT_URI')
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile, done) {
        const profileJson = profile._json;
        const kakaoAccount = profileJson.kakao_account;
        const payload: SocialUserDto = {
            id: profileJson.id,
            name: kakaoAccount.profile.nickname,
            email:
                kakaoAccount.has_email && !kakaoAccount.email_needs_agreement
                    ? kakaoAccount.email : null,
            accessToken,
            refreshToken
        };

        done(null, payload);
    }
}