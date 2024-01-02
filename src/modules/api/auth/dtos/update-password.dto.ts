import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordDTO {
    @ApiProperty({
        description: 'Password',
        example: 'P@ssw0rd',
        format: 'password',
        required: true,
        minLength: 8,
    })
    @IsNotEmpty()
    @IsString()
    old_password: string;

    @ApiProperty({
        description: 'Password',
        example: 'P@ssw0rd',
        format: 'password',
        required: true,
        minLength: 8,
    })
    @IsNotEmpty()
    @IsString()
    password: string;
}
