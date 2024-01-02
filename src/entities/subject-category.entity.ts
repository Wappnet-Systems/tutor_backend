import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { momentUTC, stringToDate, timeStamp } from '../helper/date';
import { TutorSubject } from './tutor-subject.entity';
import { Subject } from './subject.entity';

@Entity({ name: 'subject-category' })
export class SubjectCategory {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ length: 50 })
    category_name: string;

    @Column({ length: 200, nullable: true })
    description: string;

    @Column({ default: false })
    is_deleted: boolean;

    @Column({ length: 1000, nullable: true })
    media: string;

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

    @OneToMany(() => TutorSubject, (tutor_subject) => tutor_subject.subject_category)
    tutor_subject: TutorSubject[];

    @OneToMany(() => Subject, (subject) => subject.category_details)
    subjects: Subject[];
}
