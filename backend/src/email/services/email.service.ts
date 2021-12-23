import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { SendEmailFailedException } from '../exceptions/SendEmailFailed.exception';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendSignUpAuthCode(email: string, signUpAuthCode: number) {
    try {
      await this.mailerService.sendMail({
        from: `"Vocatest Auth" <${process.env.SENDER_EMAIL}>`,
        to: email,
        subject: 'Vocatest 회원가입 인증번호 안내 메일',
        html: `<p>다음 인증번호를 입력하여 회원가입을 진행해주세요.</p>
        <p>인증번호: <strong>${signUpAuthCode}</strong></p>`,
      });
    } catch (error) {
      console.dir(error);
      throw new SendEmailFailedException();
    }
  }

  public async sendResetPasswordAuthCode(
    email: string,
    resetPasswordAuthCode: number,
  ) {
    try {
      await this.mailerService.sendMail({
        from: `"Vocatest Auth" <${process.env.SENDER_EMAIL}>`,
        to: email,
        subject: 'Vocatest 비밀번호 재설정 인증번호 안내 메일',
        html: `<p>다음 인증번호를 입력하여 비밀번호 재설정을 진행해주세요.</p>
        <p>인증번호: <strong>${resetPasswordAuthCode}</strong></p>`,
      });
    } catch (error) {
      throw new SendEmailFailedException();
    }
  }
}
