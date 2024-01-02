import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminDTO {
    @ApiProperty({
        description: 'The email address of the user',
        example: 'john.doe@example.com',
        format: 'email',
        required: true,
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'First Name',
        example: 'John',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    first_name: string;

    @ApiProperty({
        description: 'Last Name',
        example: 'John',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    last_name: string;

    @ApiProperty({
        description: 'Contact Number',
        example: '1234567890',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    contact_number: number;

    @ApiProperty({
        description: 'The email address of the user',
        example: 'john.doe@example.com',
        format: 'email',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    role_id: string;
}
