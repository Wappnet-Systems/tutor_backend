import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class UpdateRoleDTO {
    @IsNotEmpty()
    @IsString()
    role_name: string;

    @IsNotEmpty()
    @IsArray()
    role_permissions: [any];
}
