import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user_activation_otp' })
export class UserActivationOtp {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ length: 50 })
    email: string;

    @Column({})
    otp: number;

    @Column({ type: 'bigint' })
    user_id: number;
}
