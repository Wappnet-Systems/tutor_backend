import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { momentUTC, stringToDate, timeStamp } from '../helper/date';
import { User } from './user.entity';
import { Booking } from './booking.entity';

@Entity({ name: 'review' })
export class Review {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ length: 1000 })
    remarks: string;

    @Column({ type: 'int' })
    rating: number;

    @Column({ type: 'bigint' })
    user_id: number;

    @Column({ type: 'bigint' })
    tutor_user_id: number;

    @Column({ type: 'bigint' })
    booking_id: number;

    @Column({ default: false })
    is_deleted: boolean;

    @ManyToOne(() => User, (user) => user.reviews_given)
    @JoinColumn({ name: 'user_id' })
    student: User;

    @ManyToOne(() => User, (user) => user.reviews)
    @JoinColumn({ name: 'tutor_user_id' })
    tutor: User;

    @ManyToOne(() => Booking, (booking) => booking.reviews)
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;

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
}
