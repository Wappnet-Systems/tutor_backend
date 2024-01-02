import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumberString, Length } from 'class-validator';

export class VerifyDTO {
    @ApiProperty({
        description: 'User Email',
        example: 'john.doe@example.com',
        format: 'email',
        required: true,
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'OTP',
        example: '',
        format: 'number',
        required: true,
        minLength: 4,
        maxLength: 4,
    })
    @IsNotEmpty()
    @IsNumberString()
    @Length(4, 4)
    otp: number;
}
