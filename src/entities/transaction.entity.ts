import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { momentUTC, stringToDate, timeStamp } from '../helper/date';
import { User } from './user.entity';
import { Booking } from './booking.entity';
import { PaymentStatusType } from 'src/utils/constant';

@Entity({ name: 'transaction' })
export class Transaction {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ type: 'double' })
    txn_amount: number;

    @Column({ type: 'bigint' })
    user_id: number;

    @Column({ type: 'bigint' })
    booking_id: number;

    @Column({ default: false })
    is_deleted: boolean;

    @Column({ length: 200 })
    stripe_payment_intent_id: string;

    @Column({ type: 'enum', enum: PaymentStatusType, default: PaymentStatusType.PENDING })
    status: PaymentStatusType;

    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
        transformer: {
            to(value: Date) {
                return momentUTC(value);
            },
            from(value: string): Date {
                return momentUTC(value);
            },
        },
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP(6)',
        transformer: {
            to(value: Date) {
                return momentUTC(value);
            },
            from(value: string): Date {
                return momentUTC(value);
            },
        },
    })
    updated_at: Date;

    @ManyToOne(() => User, (user) => user.transactions)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Booking, (booking) => booking.transactions)
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;
}
