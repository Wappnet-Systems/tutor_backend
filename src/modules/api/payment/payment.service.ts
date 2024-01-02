import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from 'src/entities/booking.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { SlackService } from 'src/services/slack.service';
import { BookingStatusType, PaymentStatusType } from 'src/utils/constant';
import Stripe from 'stripe';
import { In, Repository } from 'typeorm';
import { NotificationService } from '../notification/notification.service';
import { NotificationTitles, NotificationMessages, NotificationTypes, EmailTypes } from 'src/utils/notifications';
import { User } from 'src/entities/user.entity';
import { ChatService } from '../chat/chat.service';
import { BookingUser } from 'src/entities/booking_user.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class PaymentService {
    private stripe;

    constructor(
        private configService: ConfigService,
        private notificationService: NotificationService,
        private emailService: EmailService,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Booking) private readonly bookingRepository: Repository<Booking>,
        @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
        @InjectRepository(BookingUser) private readonly bookingUserRepository: Repository<BookingUser>,
        private slackService: SlackService,
        private chatService: ChatService,
    ) {
        this.stripe = new Stripe(process.env.API_SECRET_KEY, {
            apiVersion: '2023-08-16',
        });
    }

    async createPayment(amount, transactionObj: any): Promise<any> {
        try {
            const stripeIntent = await this.stripe.paymentIntents.create({
                amount: amount,
                currency: this.configService.get<string>('PAYMENT_CURRENCY'),
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            transactionObj['stripe_payment_intent_id'] = stripeIntent.id;
            await this.transactionRepository.save(transactionObj);
            return stripeIntent;
        } catch (error) {
            await this.slackService.send('Error in createPayment', true);
            await this.slackService.send(error + ' Error in adding creating payment intent', true);
            return;
        }
    }

    async getTransactionByBookingId(id: any, user_id: any): Promise<any> {
        const transaction_detail = await this.transactionRepository.findOne({
            where: {
                booking_id: id,
                user_id: user_id,
                is_deleted: false,
                status: In([PaymentStatusType.FAILED, PaymentStatusType.PENDING]),
            },
        });
        return transaction_detail;
    }

    async getBookingById(id: any, user_id: any): Promise<any> {
        const transaction_detail = await this.bookingRepository.findOne({
            where: {
                id: id,
                student_user_id: user_id,
                is_deleted: false,
                status: In([BookingStatusType.PAYMENT_PENDING, BookingStatusType.PAYMENT_FAILED]),
            },
        });
        return transaction_detail;
    }

    async updateTransaction(stripeObj): Promise<any> {
        const transaction_detail = await this.transactionRepository.findOne({
            where: { stripe_payment_intent_id: stripeObj.data.object.id, is_deleted: false },
        });

        if (transaction_detail) {
            const booking_detail = await this.bookingRepository.findOne({
                where: { id: transaction_detail.booking_id, is_deleted: false },
            });
            const tutor_detail = await this.userRepository.findOne({
                where: { id: booking_detail.tutor_user_id },
            });
            if (stripeObj.type === 'payment_intent.succeeded') {
                transaction_detail.status = PaymentStatusType.SUCCESS;
                await this.notificationService.addNotification({
                    user_id: booking_detail.student_user_id,
                    title: NotificationTitles.PAYMENT_SUCCESSFUL,
                    description: NotificationMessages.PAYMENT_SUCCESSFUL.replace(
                        '{tutor_name}',
                        tutor_detail.first_name + ' ' + tutor_detail.last_name,
                    ),
                    type: NotificationTypes.PAYMENT_SUCCESSFUL,
                });

                await this.emailService.sendEmail(
                    EmailTypes.PAYMENT_SUCCESSFUL,
                    booking_detail.student_user_id,
                    booking_detail.student_user_id,
                    booking_detail.tutor_user_id,
                    '',
                    '',
                    '',
                );
                await this.transactionRepository.save(transaction_detail);
                booking_detail.status = BookingStatusType.PAYMENT_COMPLETED;
                await this.bookingRepository.save(booking_detail);
                const bookingUsers = await this.bookingUserRepository.find({
                    where: { booking_id: booking_detail.id, is_deleted: false },
                });
                if (bookingUsers.length > 0) {
                    for (let index = 0; index < bookingUsers.length; index++) {
                        const bookingUser = bookingUsers[index];
                        const conversation = await this.chatService.getStudentTutorConversation(booking_detail.tutor_user_id, bookingUser.user_id);
                        if (conversation) {
                            conversation['conversation_end_date'] = booking_detail.booking_end_date;
                            await this.chatService.updateConversation(conversation);
                        } else {
                            await this.chatService.createConversation({
                                tutor_user_id: booking_detail.tutor_user_id,
                                student_user_id: bookingUser.user_id,
                                booking_id: booking_detail.id,
                                conversation_end_date: booking_detail.booking_end_date,
                            });
                        }
                    }
                }
            } else {
                await this.notificationService.addNotification({
                    user_id: booking_detail.student_user_id,
                    title: NotificationTitles.PAYMENT_FAILED,
                    description: NotificationMessages.PAYMENT_FAILED.replace('{tutor_name}', tutor_detail.first_name + ' ' + tutor_detail.last_name),
                    type: NotificationTypes.PAYMENT_FAILED,
                });
                await this.emailService.sendEmail(
                    EmailTypes.PAYMENT_FAILED,
                    booking_detail.student_user_id,
                    booking_detail.student_user_id,
                    booking_detail.tutor_user_id,
                    '',
                    '',
                    '',
                );
                transaction_detail.status = PaymentStatusType.FAILED;
                await this.transactionRepository.save(transaction_detail);
                booking_detail.status = BookingStatusType.PAYMENT_FAILED;
                await this.bookingRepository.save(booking_detail);
            }
        }
    }
}
