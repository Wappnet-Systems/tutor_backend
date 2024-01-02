import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { momentUTC } from '../helper/date';
import { AvailabilityStatusType } from '../utils/constant';
import { Booking } from './booking.entity';
import { User } from './user.entity';

@Entity({ name: 'tutor-availability' })
export class TutorAvailability {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ type: 'bigint' })
    user_id: number;

    @Column({ type: 'date' })
    date: Date;

    @Column({
        type: 'timestamp',
        transformer: {
            to(value: Date) {
                return momentUTC(value);
            },
            from(value: string): Date {
                return momentUTC(value);
            },
        },
    })
    from_time: Date;

    @Column({
        type: 'timestamp',
        transformer: {
            to(value: Date) {
                return momentUTC(value);
            },
            from(value: string): Date {
                return momentUTC(value);
            },
        },
    })
    to_time: Date;

    @Column({ type: 'int' })
    week_day: number;

    @Column({ default: AvailabilityStatusType.OPEN })
    status: AvailabilityStatusType;

    @Column({ type: 'bigint', nullable: true })
    booking_id: number;

    @Column({ default: false })
    is_deleted: boolean;

    @Column({ default: false })
    is_paid: boolean;

    @Column({ type: 'datetime', nullable: true })
    paid_on: Date;

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

    @ManyToOne(() => Booking, (booking) => booking.slots)
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;

    @ManyToOne(() => User, (user: User) => user.tutor_availability)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
