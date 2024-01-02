import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { UserType } from '../../../../utils/constant';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDTO {
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
        description: 'user type of user (Admin == 1, Tutor == 2, Student == 3)',
        example: '3',
        format: 'number',
        required: true,
    })
    @IsOptional()
    @IsEnum(UserType)
    user_type: UserType;

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
        description: 'Date of birth // YYYY-MM-DD',
        example: '1998-08-31',
        format: 'string',
        required: true,
    })
    @IsString()
    dob: Date;

    @ApiProperty({
        description: 'Contact Number',
        example: '1234567890',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    contact_number: number;

    @ApiProperty({
        description: 'Address',
        example: 'Test Test',
        format: 'string',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({
        description: 'Lat',
        example: '11.33',
        format: 'string',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    lat: string;

    @ApiProperty({
        description: 'Lng',
        example: '12.22',
        format: 'string',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    lng: string;

    @ApiProperty({
        description: 'Password',
        example: 'P@ssw0rd',
        format: 'password',
        required: true,
        minLength: 8,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(8, {
        message: 'new password field need at least 8 characters',
    })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+={}[\]|;:'",.<>?`~])(?=.*[^\s]).{8,}$/, {
        message:
            'new password field will contain at least 1 upper case letter, at least 1 lower case letter, at least 1 number and special character',
    })
    password: string;
}
