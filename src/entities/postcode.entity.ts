import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { momentUTC, stringToDate, timeStamp } from '../helper/date';
import { TutorPostcode } from './tutor-postcode.entity';

@Entity({ name: 'postcode' })
export class Postcode {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ length: 50 })
    postcode: string;

    @Column({ length: 50 })
    place_name: string;

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

    @OneToMany(() => TutorPostcode, (tutor_postcode) => tutor_postcode.postcode)
    tutor_postcodes: TutorPostcode[];
}
