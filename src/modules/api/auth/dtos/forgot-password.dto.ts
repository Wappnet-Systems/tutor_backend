import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDTO {
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
}
