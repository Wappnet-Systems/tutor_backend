import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { momentUTC, stringToDate, timeStamp } from '../helper/date';
import { Subject } from './subject.entity';
import { Booking } from './booking.entity';

@Entity({ name: 'booking-subject' })
export class BookingSubject {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ type: 'bigint' })
    subject_id: number;

    @Column({ type: 'bigint' })
    booking_id: number;

    @Column({ default: false })
    is_deleted: boolean;

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

    @ManyToOne(() => Booking, (booking) => booking.bookingSubjects)
    @JoinColumn({ name: 'booking_id' })
    booking: Booking;

    @ManyToOne(() => Subject, (subject) => subject.tutor_subject)
    @JoinColumn({ name: 'subject_id' })
    subject: Subject;
}
