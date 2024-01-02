import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyInviteeDTO {
    @ApiProperty({
        description: 'User Email',
        example: '',
        format: 'date',
        required: true,
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;
}
