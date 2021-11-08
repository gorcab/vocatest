import { MailerService } from '@nestjs-modules/mailer';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { SendEmailFailedException } from '../exceptions/SendEmailFailed.exception';
import { SendSignUpAuthCodeDto } from '../dtos/SendSignUpAuthCode.dto';

describe('EmailService', () => {
  let service: EmailService;
  let mockMailerService: {
    sendMail: () => Promise<void>;
  };

  beforeEach(async () => {
    mockMailerService = {
      sendMail: async () => Promise.resolve(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('정의되어야 한다.', () => {
    expect(service).toBeDefined();
  });

  it('회원가입 인증 이메일 전송이 실패하면 SendEmailFailedException이 발생한다.', async () => {
    mockMailerService.sendMail = async () => Promise.reject();
    const sendSignUpAuthCodeDto: SendSignUpAuthCodeDto = {
      email: 'tester@gmail.com',
      signUpAuthCode: 123456,
    };

    await expect(
      service.sndSignUpAuthCode(sendSignUpAuthCodeDto),
    ).rejects.toThrow(new SendEmailFailedException());
  });

  it('회원가입 인증 이메일 전송이 완료되면 에러가 발생하지 않는다.', async () => {
    const sendSignUpAuthCodeDto: SendSignUpAuthCodeDto = {
      email: 'tester@gmail.com',
      signUpAuthCode: 123456,
    };

    const result = await service.sndSignUpAuthCode(sendSignUpAuthCodeDto);

    expect(result).toBeUndefined();
  });
});
