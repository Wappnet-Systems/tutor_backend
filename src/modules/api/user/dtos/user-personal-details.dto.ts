import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GenderType } from '../../../../utils/constant';
import { Transform } from 'class-transformer';

export class UserPersonalDetailsDTO {
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
        description: 'Date of birth',
        example: '31-08-1998',
        format: 'date',
        required: true,
    })
    @Transform(({ value }) => new Date(value))
    @IsDate()
    dob: Date;

    @ApiProperty({
        description: 'gender (Male == 1, Female == 2, Other == 3)',
        example: '1',
        format: 'number',
        required: true,
    })
    @IsEnum(GenderType)
    @IsNotEmpty()
    gender: GenderType;

    @ApiProperty({
        description: 'Tag line',
        example: 'Add your tag line',
        format: 'string',
        required: false,
    })
    @IsString()
    tag_line: string;

    @ApiProperty({
        description: 'Hourly Fee',
        example: '20',
        format: 'string',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    hourly_rate: number;

    @ApiProperty({
        description: 'Hourly Fee For 2 students',
        example: '20',
        format: 'string',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    hourly_rate2: number;

    @ApiProperty({
        description: 'Hourly Fee for 3 students',
        example: '20',
        format: 'string',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    hourly_rate3: number;

    @ApiProperty({
        description: 'Languages ID',
        example: '1,2,3,4',
        format: 'string',
        required: false,
    })
    @IsString()
    languages: string;

    @ApiProperty({
        description: 'I can teach offline',
        example: 'false',
        format: 'boolean',
        required: false,
    })
    @IsBoolean()
    teach_at_offline: boolean;

    @ApiProperty({
        description: 'I can teach at online',
        example: 'false',
        format: 'boolean',
        required: false,
    })
    @IsBoolean()
    teach_at_online: boolean;

    @ApiProperty({
        description: 'A brief Introduction',
        example: 'A brief Introduction',
        format: 'boolean',
        required: false,
    })
    @IsString()
    introduction: boolean;

    @ApiProperty({
        description: 'Skype',
        example: '',
        format: 'string',
        required: false,
    })
    @IsString()
    skype: string;

    @ApiProperty({
        description: 'Contact number',
        example: '',
        format: 'string',
        required: false,
    })
    @IsString()
    contact_number: string;

    @ApiProperty({
        description: 'whatsapp number',
        example: '1234567890',
        format: 'string',
        required: false,
    })
    @IsString()
    whatsapp: string;

    @ApiProperty({
        description: 'website',
        example: 'https://abc.com',
        format: 'string',
        required: false,
    })
    @IsString()
    website: string;

    @ApiProperty({
        description: 'Address',
        example: 'Test Test',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    address: string;

    @ApiProperty({
        description: 'Lat',
        example: '11.33',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    lat: string;

    @ApiProperty({
        description: 'Lng',
        example: '12.22',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    lng: string;

    @ApiProperty({
        description: 'postcode',
        example: '1,2,3,4',
        format: 'string',
        required: true,
    })
    @IsOptional()
    @IsString()
    postcode_ids: string;
}
