import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDTO {
    @ApiProperty({
        description: 'User Email',
        example: 'john.doe@example.com',
        format: 'email',
        required: true,
    })
    @IsNotEmpty()
    @IsEmail()
    @Transform((o) => o.value.toLowerCase())
    email: string;

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
