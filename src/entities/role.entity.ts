import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { momentUTC } from '../helper/date';
import { RolePermission } from './roles_permission.entity';
import { UserPermission } from './user-permission.entity';

@Entity({ name: 'role' })
export class Role {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id: number;

    @Column({ length: 50 })
    role_name: string;

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

    @OneToMany(() => RolePermission, (role_permission) => role_permission.role)
    role_permission: RolePermission[];

    @OneToMany(() => UserPermission, (user_permission) => user_permission.role)
    user_role: UserPermission[];
}
