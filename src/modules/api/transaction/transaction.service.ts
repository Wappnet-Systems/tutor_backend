import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from 'src/entities/booking.entity';
import { Transaction } from 'src/entities/transaction.entity';
import { User } from 'src/entities/user.entity';
import { SlackService } from 'src/services/slack.service';
import { BookingStatusType, PaymentStatusType } from 'src/utils/constant';
import { In, Repository } from 'typeorm';

@Injectable()
export class TransactionService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Booking) private readonly bookingRepository: Repository<Booking>,
        @InjectRepository(Transaction) private readonly transactionRepository: Repository<Transaction>,
        private configService: ConfigService,
        private readonly slackService: SlackService,
    ) {}

    async getCounts(user_id: number) {
        try {
            const commission = this.configService.get<number>('COMMISSION');
            let transactions = await this.transactionRepository
                .createQueryBuilder('transaction')
                .where('transaction.is_deleted = :isDeleted', {
                    isDeleted: false,
                })
                .leftJoinAndSelect('transaction.booking', 'booking')
                .where('booking.tutor_user_id = :userId AND booking.is_deleted = :isDeleted', {
                    userId: user_id,
                    isDeleted: false,
                })
                .leftJoinAndSelect('booking.tutor', 'tutor')
                .leftJoinAndSelect('transaction.user', 'user')
                .leftJoinAndSelect('booking.slots', 'slots')
                .getMany();

            transactions = transactions.filter((transaction) => {
                if (transaction.status != PaymentStatusType.FAILED) {
                    return transaction;
                }
            });

            let totalIncome = 0;
            let incomeWithdrawn = 0;
            let pendingIncome = 0;
            let availableIncome = 0;
            for (let index = 0; index < transactions.length; index++) {
                const transaction = transactions[index];
                transaction['amount_paid'] = 0;
                let count = 0;
                let completed_slots = 0;
                let pending_slots = 0;
                for (let index = 0; index < transaction.booking.slots.length; index++) {
                    const slot = transaction.booking.slots[index];
                    if (slot.is_paid) {
                        count = count + 1;
                    }
                    if (new Date(slot.from_time) < new Date() && !slot.is_paid) {
                        completed_slots = completed_slots + 1;
                    }
                    if (new Date(slot.from_time) > new Date() && !slot.is_paid) {
                        pending_slots = pending_slots + 1;
                    }
                }
                const per_slot_cost = transaction.txn_amount / transaction.booking.slots.length;
                transaction['amount_paid'] = count * per_slot_cost;
                if (isNaN(transaction['amount_paid'])) {
                    transaction['amount_paid'] = 0;
                }
                const commission = this.configService.get<number>('COMMISSION');
                transaction['amount_paid'] = transaction['amount_paid'] * ((100 - commission) / 100);
                transaction['to_paid'] = transaction['txn_amount'] * ((100 - commission) / 100);
                pendingIncome += pending_slots * per_slot_cost * ((100 - commission) / 100);
                availableIncome += completed_slots * per_slot_cost * ((100 - commission) / 100);
                incomeWithdrawn += transaction['amount_paid'];
                totalIncome += transaction['amount_paid'] + transaction['to_paid'];
            }

            const counts = {
                total_income: totalIncome,
                income_withdrawn: incomeWithdrawn,
                pending_income: pendingIncome,
                available_income: availableIncome,
            };
            return counts;
        } catch (error) {
            await this.slackService.send('Error in getCounts', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getEarnings(user_id: number, from_date: any, to_date: any) {
        try {
            const commission = this.configService.get<number>('COMMISSION');
            const rawData = await this.bookingRepository
                .createQueryBuilder('booking')
                .leftJoinAndSelect('booking.transactions', 'transactions')
                .where('booking.tutor_user_id = :userId AND booking.is_deleted = :isDeleted AND booking.status = :status', {
                    userId: user_id,
                    isDeleted: false,
                    status: BookingStatusType.COMPLETED,
                })
                .andWhere('booking.booking_end_date >= :startDate', { startDate: from_date })
                .andWhere('booking.booking_end_date <= :endDate', { endDate: to_date })
                .select('DATE(booking.booking_end_date)', 'date')
                .addSelect('COUNT(transactions.id)', 'count')
                .addSelect('SUM(transactions.txn_amount)', 'amount')
                .groupBy('date')
                .getRawMany();

            const userTransactionData = rawData.map((row) => ({
                date: row.date,
                count: row.count,
                amount: row.amount * ((100 - commission) / 100),
            }));
            return userTransactionData;
        } catch (error) {
            await this.slackService.send('Error in getEarnings', true);
            await this.slackService.send(error, true);
            return;
        }
    }

    async getEarningsForAdmin(from_date: any, to_date: any) {
        try {
            const rawData = await this.transactionRepository
                .createQueryBuilder('transaction')
                .where('transaction.is_deleted = :isDeleted', {
                    isDeleted: false,
                })
                .andWhere('transaction.status = :status', { status: PaymentStatusType.SUCCESS.toString() })
                .andWhere('transaction.created_at >= :startDate', { startDate: from_date })
                .andWhere('transaction.created_at <= :endDate', { endDate: to_date })
                .select('DATE(transaction.created_at)', 'date')
                .addSelect('SUM(transaction.txn_amount)', 'amount')
                .groupBy('date')
                .getRawMany();

            const userTransactionData = rawData.map((row) => ({
                date: row.date,
                amount: row.amount,
            }));
            return userTransactionData;
        } catch (error) {
            await this.slackService.send('Error in getEarningsForAdmin', true);
            await this.slackService.send(error + 'Error in Txn', true);
            return;
        }
    }

    async getAllTransactionsForAdmin() {
        try {
            let transactions = await this.transactionRepository
                .createQueryBuilder('transaction')
                .where('transaction.is_deleted = :isDeleted', {
                    isDeleted: false,
                })
                .leftJoinAndSelect('transaction.booking', 'booking')
                .leftJoinAndSelect('booking.tutor', 'tutor')
                .leftJoinAndSelect('transaction.user', 'user')
                .leftJoinAndSelect('booking.slots', 'slots')
                .getMany();

            transactions = transactions.filter((transaction) => {
                if (transaction.status != PaymentStatusType.FAILED) {
                    return transaction;
                }
            });

            for (let index = 0; index < transactions.length; index++) {
                const transaction = transactions[index];
                transaction['amount_paid'] = 0;
                let count = 0;
                for (let index = 0; index < transaction.booking.slots.length; index++) {
                    const slot = transaction.booking.slots[index];
                    if (slot.is_paid) {
                        count = count + 1;
                    }
                }
                const per_slot_cost = transaction.txn_amount / transaction.booking.slots.length;
                transaction['amount_paid'] = count * per_slot_cost;
                if (isNaN(transaction['amount_paid'])) {
                    transaction['amount_paid'] = 0;
                }
                const commission = this.configService.get<number>('COMMISSION');
                transaction['amount_paid'] = transaction['amount_paid'] * ((100 - commission) / 100);
                transaction['to_paid'] = transaction['txn_amount'] * ((100 - commission) / 100);
            }
            return transactions;
        } catch (error) {
            await this.slackService.send('Error in getAllTransactionsForAdmin', true);
            await this.slackService.send(error + 'Error in Txn', true);
            return;
        }
    }
}
