import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { momentUTC } from '../helper/date';
import { BookingModes, BookingStatusType } from '../utils/constant';
import { User } from './user.entity';
import { TutorAvailability } from './tutor-availability.entity';
import { Assignment } from './assignment.entity';
import { Review } from './review.entity';
import { BookingUser } from './booking_user.entity';
import { Transaction } from './transaction.entity';
import { BookingSubject } from './booking-subject.entity';

@Entity({ name: 'booking' })
export class Booking {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ type: 'bigint' })
    tutor_user_id: number;

    @Column({ type: 'bigint' })
    student_user_id: number;

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
    booking_start_date: Date;

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
    booking_end_date: Date;

    @Column({ type: 'bigint' })
    hourly_rate: number;

    @Column({ type: 'bigint' })
    total_amount: number;

    @Column({ type: 'bigint' })
    total_slots: number;

    @Column({ length: 2000, default: '' })
    special_comments: string;

    @Column({ length: 100, nullable: true })
    address: string;

    @Column({ length: 100, nullable: true })
    lat: string;

    @Column({ length: 100, nullable: true })
    lng: string;

    @Column()
    mode: BookingModes;

    @Column({ length: 2000, default: '' })
    rejection_reason: string;

    @Column({ default: BookingStatusType.PENDING })
    status: BookingStatusType;

    @Column({ default: false })
    is_deleted: boolean;

    @Column({ default: false })
    is_paid: boolean;

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

    @ManyToOne(() => User, (user) => user.tutor_bookings)
    @JoinColumn({ name: 'tutor_user_id' })
    tutor: User;

    @ManyToOne(() => User, (user) => user.student_bookings)
    @JoinColumn({ name: 'student_user_id' })
    student: User;

    @OneToMany(() => TutorAvailability, (slot) => slot.booking)
    slots: TutorAvailability[];

    @OneToMany(() => BookingSubject, (bookingSubjects) => bookingSubjects.booking)
    bookingSubjects: BookingSubject[];

    @OneToMany(() => Assignment, (assignment) => assignment.booking)
    assignments: Assignment[];

    @OneToMany(() => Review, (review) => review.booking)
    reviews: Review[];

    @OneToMany(() => BookingUser, (bookingUsers) => bookingUsers.booking)
    bookingUsers: BookingUser[];

    @OneToMany(() => Transaction, (transaction) => transaction.booking)
    transactions: Transaction[];
}
