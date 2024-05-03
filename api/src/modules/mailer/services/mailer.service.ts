import {
  HttpException, Injectable, Inject, forwardRef
} from '@nestjs/common';
import { QueueService, StringHelper } from 'src/kernel';
import { createTransport } from 'nodemailer';
import { SettingService } from 'src/modules/settings';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { render } from 'mustache';
import { SETTING_KEYS } from 'src/modules/settings/constants';
import { IMail } from '../interfaces';

const TEMPLATE_DIR = join(process.env.TEMPLATE_DIR, 'emails');
@Injectable()
export class MailerService {
  private mailerQueue;

  constructor(
    private readonly queueService: QueueService,
    @Inject(forwardRef(() => SettingService))
    private readonly settingService: SettingService
  ) {
    this.init();
  }

  private async init() {
    this.mailerQueue = this.queueService.createInstance('MAILER_QUEUE');
    this.mailerQueue.process(
      process.env.MAILER_CONCURRENCY || 1,
      this.process.bind(this)
    );
  }

  private async getTransport() {
    const smtp = await this.settingService.getKeyValue(SETTING_KEYS.SMTP_TRANSPORTER);
    if (!smtp || !smtp.host || !smtp.auth || !smtp.port || !smtp.auth.user || !smtp.auth.pass) {
      throw new HttpException('Invalid confirguration!', 400);
    }
    smtp.port = parseInt(smtp.port, 10);
    return createTransport(smtp);
  }

  private getTemplate(template = 'default', isLayout = false): string {
    // eslint-disable-next-line no-param-reassign
    template = StringHelper.getFileName(template, true);

    if (template === 'blank') {
      return isLayout ? '[[BODY]]' : '';
    }

    const layoutFile = isLayout ? join(TEMPLATE_DIR, 'layouts', `${template}.html`) : join(TEMPLATE_DIR, `${template}.html`);
    if (!existsSync(layoutFile)) {
      return isLayout ? '[[BODY]]' : '';
    }

    return readFileSync(layoutFile, 'utf8');
  }

  private async process(job: any, done: Function) {
    try {
      const transport = await this.getTransport();
      const data = job.data as IMail;
      let { html } = data;
      if (!html && data.template) {
        html = this.getTemplate(data.template);
      }

      const body = html ? render(html, data.data) : '';
      const siteName = await this.settingService.getKeyValue(SETTING_KEYS.SITE_NAME);
      const logoUrl = await this.settingService.getKeyValue(SETTING_KEYS.LOGO_URL);
      const layout = this.getTemplate(data.layout, true);
      html = render(layout, {
        siteName: siteName || process.env.SITENAME || process.env.DOMAIN,
        logoUrl,
        subject: data.subject
      }).replace('[[BODY]]', body);
      const senderConfig = await this.settingService.getKeyValue(SETTING_KEYS.SENDER_EMAIL);
      const senderEmail = senderConfig || process.env.SENDER_EMAIL;
      await transport.sendMail({
        from: senderEmail,
        to: Array.isArray(data.to) ? data.to.join(',') : data.to,
        cc: Array.isArray(data.cc) ? data.cc.join(',') : data.cc,
        bcc: Array.isArray(data.cc) ? data.cc.join(',') : data.cc,
        subject: data.subject,
        html
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('mail_error', e);
    } finally {
      done();
    }
  }

  public async send(email: IMail) {
    await this.mailerQueue.createJob(email).save();
  }

  public async verify() {
    const transport = await this.getTransport();
    const siteName = await this.settingService.getKeyValue(SETTING_KEYS.SITE_NAME) || process.env.DOMAIN;
    const senderEmail = await this.settingService.getKeyValue(SETTING_KEYS.SENDER_EMAIL) || process.env.SENDER_EMAIL;
    const adminEmail = await this.settingService.getKeyValue(SETTING_KEYS.ADMIN_EMAIL) || process.env.ADMIN_EMAIL;
    return transport.sendMail({
      from: senderEmail,
      to: adminEmail,
      subject: `Test email ${siteName}`,
      html: 'Hello, this is test email!'
    });
  }
}
