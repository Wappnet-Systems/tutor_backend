import { Injectable } from '@nestjs/common';
import { User } from '../../../entities/user.entity';
import { UserService } from '../user/user.service';
import { UserActivationOtp } from 'src/entities/user-activation-otp.entity';
import { MailService } from 'src/services/mail.service';
import { SlackService } from 'src/services/slack.service';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService, private mailService: MailService, private slackNotificationService: SlackService) {}
    async getUserById(user_id: number): Promise<User> {
        return await this.userService.getUserById(user_id);
    }

    async getUserByEmail(email: string): Promise<User> {
        return await this.userService.getUserByEmail(email);
    }

    async createUser(user: any): Promise<User> {
        return await this.userService.createUser(user);
    }

    async updateUser(user: User): Promise<User> {
        return await this.userService.updateUser(user);
    }

    async generateSaveOTP(email: string, user_id: number): Promise<UserActivationOtp> {
        return await this.userService.generateSaveOtp(email, user_id);
    }

    async getOtp(user_id: number): Promise<UserActivationOtp> {
        return await this.userService.getOtp(user_id);
    }

    async sendActivationEmail(email: string, otp: number) {
        this.mailService
            .sendMail({
                to: email,
                subject: 'Signup Activation OTP',
                html: `OTP for signup : ${otp}`,
            })
            .then(() => {
                const text = `Signup Activation OTP email send to ${email}`;
                this.slackNotificationService.send(text, false);
            })
            .catch((error) => {
                const text = `Error in sending Signup Activation OTP email to ${email}`;
                this.slackNotificationService.send(text, true);
            });
    }

    async sendEmail(email: string, subject: string, content: string) {
        this.mailService
            .sendMail({
                to: email,
                subject: subject,
                html: content,
            })
            .then(() => {
                const text = `${subject} email send to ${email}`;
                this.slackNotificationService.send(text, false);
            })
            .catch((error) => {
                const text = `Error in sending ${subject} email to ${email}`;
                this.slackNotificationService.send(text, true);
            });
    }
}
