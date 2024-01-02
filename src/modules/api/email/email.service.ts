import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailTemplate } from 'src/entities/email-template.entity';
import { SlackService } from 'src/services/slack.service';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { MailService } from 'src/services/mail.service';

@Injectable()
export class EmailService {
    constructor(
        @InjectRepository(EmailTemplate) private readonly emailTemplateRepository: Repository<EmailTemplate>,
        private readonly slackService: SlackService,
        private readonly userService: UserService,
        private mailService: MailService,
    ) {}
    async createEmailTemplate(emailTemplateObj: any): Promise<EmailTemplate> {
        try {
            const email = await this.emailTemplateRepository.save(emailTemplateObj);
            return email;
        } catch (error) {
            await this.slackService.send('Error in createEmailTemplate', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async updateEmailTemplate(emailTemplateObj: any): Promise<EmailTemplate> {
        try {
            const email = await this.emailTemplateRepository.save(emailTemplateObj);
            return email;
        } catch (error) {
            await this.slackService.send('Error in updateEmailTemplate', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getEmailById(id): Promise<EmailTemplate> {
        try {
            const email = await this.emailTemplateRepository.findOne({
                where: { id: id, is_deleted: false },
            });
            return email;
        } catch (error) {
            await this.slackService.send('Error in getEmailById', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getAllEmails(): Promise<EmailTemplate[]> {
        try {
            const emails = await this.emailTemplateRepository.find({
                where: { is_deleted: false },
            });
            return emails;
        } catch (error) {
            await this.slackService.send('Error in getEmailById', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async sendEmail(emailType: string, receiver_id: any, student_id: any, tutor_id: any, resetLink: any, password: any, otp: any) {
        try {
            const email = await this.emailTemplateRepository.findOne({
                where: { type: emailType, is_deleted: false },
            });
            const receiver_detail = await this.userService.getUserById(receiver_id);
            email.format = email.format.replaceAll('%firstName%', receiver_detail.first_name);
            if (student_id) {
                const student_detail = await this.userService.getUserById(student_id);
                email.format = email.format.replaceAll('%firstName%', student_detail.first_name);
            }

            if (student_id) {
                const student_detail = await this.userService.getUserById(student_id);
                email.format = email.format.replaceAll('%studentName%', student_detail.first_name);
            }

            if (tutor_id) {
                const tutor_detail = await this.userService.getUserById(tutor_id);
                email.format = email.format.replaceAll('%tutorName%', tutor_detail.first_name);
            }

            // if (tutor_id) {
            //     const tutor_detail = await this.userService.getUserById(tutor_id);
            //     email.format = email.format.replaceAll('%tutorName%', tutor_detail.first_name);
            // }

            // if (tutor_id) {
            //     const tutor_detail = await this.userService.getUserById(tutor_id);
            //     email.format = email.format.replaceAll('%tutorName%', tutor_detail.first_name);
            // }

            if (resetLink) {
                email.format = email.format.replaceAll('%resetLink%', resetLink);
            }
            if (password) {
                email.format = email.format.replaceAll('%password%', password);
            }
            if (otp) {
                email.format = email.format.replaceAll('%otp%', otp);
            }
            this.mailService
                .sendMail({
                    to: receiver_detail.email,
                    subject: email.subject,
                    html: email.format,
                })
                .then(() => {
                    const text = `${email.subject} email send to ${receiver_detail.email}`;
                    this.slackService.send(text, false);
                })
                .catch((error) => {
                    const text = `Error in sending ${email.subject} email to ${receiver_detail.email}`;
                    this.slackService.send(text, true);
                });
        } catch (error) {
            await this.slackService.send('Error in sendEmail', true);
            await this.slackService.send(error, true);
            return;
        }
    }
}
