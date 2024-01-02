import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { BookingModes } from 'src/utils/constant';

export class BookingDTO {
    @ApiProperty({
        description: 'Slot Ids',
        example: [1, 2, 3, 4],
        format: 'array',
        required: true,
    })
    @IsNotEmpty()
    @IsArray()
    slots: number[];

    @ApiProperty({
        description: 'Tutor Id',
        example: '1',
        format: 'number',
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    tutor_id: number;

    @ApiProperty({
        description: 'Subject Id',
        example: '1',
        format: 'number',
        required: true,
    })
    @IsNotEmpty()
    @IsArray()
    subject_ids: number[];

    @ApiProperty({
        description: 'Booking Modes, 1 == online, 2 == offline',
        example: '1',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    mode: BookingModes;

    @ApiProperty({
        description: 'Address',
        example: 'Scarmento CA',
        format: 'string',
        required: false,
    })
    @IsOptional()
    @IsString()
    address: string;

    @ApiProperty({
        description: 'Lat',
        example: '11.22',
        format: 'string',
        required: false,
    })
    @IsOptional()
    @IsString()
    lat: string;

    @ApiProperty({
        description: 'Lng',
        example: '12.11',
        format: 'string',
        required: false,
    })
    @IsOptional()
    @IsString()
    lng: string;

    @ApiProperty({
        description: 'Invitee details',
        example: "[{email : '', first_name: '', ''}]",
        format: 'array',
        required: true,
    })
    @IsOptional()
    @IsArray()
    @Type(() => Object)
    invitee: any[];

    @ApiProperty({
        description: 'Special Comment',
        example: '1',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    special_comments: string;

    @ApiProperty({
        description: 'Calculated Price',
        example: '120',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    calculated_price: number;
}
