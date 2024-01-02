import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ChangePasswordDTO {
    @ApiProperty({
        description: 'Password',
        example: 'P@ssw0rd',
        format: 'password',
        required: true,
        minLength: 8,
    })
    @IsNotEmpty()
    password: string;
}
