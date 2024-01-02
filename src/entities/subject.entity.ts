import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { momentUTC, stringToDate, timeStamp } from '../helper/date';
import { TutorSubject } from './tutor-subject.entity';
import { SubjectCategory } from './subject-category.entity';
import { Booking } from './booking.entity';

@Entity({ name: 'subject' })
export class Subject {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ length: 50 })
    subject_name: string;

    @Column({ type: 'bigint' })
    subject_category_id: number;

    @Column({ length: 2000, nullable: true })
    description: string;

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

    @OneToMany(() => TutorSubject, (tutorSubject) => tutorSubject.subject_category)
    tutor_subject: TutorSubject[];

    @ManyToOne(() => SubjectCategory, (category_details) => category_details.subjects)
    @JoinColumn({ name: 'subject_category_id' })
    category_details: SubjectCategory;
}
