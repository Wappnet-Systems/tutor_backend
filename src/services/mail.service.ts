import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    private readonly smtpConfig = {
        host: this.configService.get<string>('smtp_host'),
        port: this.configService.get<number>('smtp_port'),
        secure: this.configService.get<boolean>('smtp_secure'),
        auth: {
            user: this.configService.get<string>('smtp_username'),
            pass: this.configService.get<string>('smtp_password'),
        },
    };

    constructor(private readonly configService: ConfigService) {
        this.transporter = nodemailer.createTransport(this.smtpConfig);
    }

    async sendMail(mailOptions: nodemailer.SendMailOptions): Promise<boolean> {
        await this.transporter.sendMail(mailOptions);
        return true;
    }
}
