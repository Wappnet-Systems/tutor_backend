import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class AssignmentsDTO {
    @ApiProperty({
        description: 'Assignment title',
        example: 'Assignment 1',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({
        description: 'Assignment Description',
        example: 'Assignment Description',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({
        description: 'Student Id',
        example: 1,
        format: 'number',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    student_user_id: number;

    @ApiProperty({
        description: 'Booking Id',
        example: 1,
        format: 'number',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    booking_id: number;

    @ApiProperty({
        description: 'Target Completion Date',
        example: 'Aug 12 2023',
        format: 'date',
        required: true,
    })
    @IsString()
    target_completion_date: Date;

    @ApiProperty({
        description: 'Added Media',
        example: '',
        format: 'string',
        required: false,
    })
    @IsOptional()
    @IsString()
    media: string;

    @ApiProperty({
        type: 'file',
        description: 'File to upload',
        format: 'binary',
        required: false,
    })
    @IsOptional()
    file: Express.Multer.File;
}
