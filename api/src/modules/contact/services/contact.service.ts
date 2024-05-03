import { Injectable } from '@nestjs/common';
import { SettingService } from 'src/modules/settings';
import { MailerService } from 'src/modules/mailer/services/mailer.service';

@Injectable()
export class ContactService {
  constructor(
    private readonly mailService: MailerService
  ) {
  }

  public async contact(data: any) {
    const adminEmail = SettingService.getByKey('adminEmail').value || process.env.ADMIN_EMAIL;
    await this.mailService.send({
      subject: 'New contact',
      to: adminEmail,
      data,
      template: 'contact.html'
    });
    return true;
  }
}
