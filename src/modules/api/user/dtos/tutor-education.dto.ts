import { IsBoolean, IsDate, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class TutorEducationDetailsDTO {
    @ApiProperty({
        description: 'Degree/course title',
        example: 'Bachelor of Engineering',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    course_name: string;

    @ApiProperty({
        description: 'University/Institute title',
        example: 'Gujarat Technological University',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    university_name: string;

    @ApiProperty({
        description: 'Location',
        example: 'TX, USA',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    location: string;

    @ApiProperty({
        description: 'Start Date // YYYY-MM-DD',
        example: '2015-05-15',
        format: 'string',
        required: true,
    })
    @Transform(({ value }) => new Date(value))
    @IsDate()
    start_date: Date;

    @ApiProperty({
        description: 'End Date // YYYY-MM-DD',
        example: '2019-05-15',
        format: 'string',
        required: false,
    })
    @Transform(({ value }) => new Date(value))
    @IsDate()
    end_date: Date;

    @ApiProperty({
        description: 'is ongoing',
        example: 'false',
        format: 'boolean',
        required: false,
    })
    @IsBoolean()
    is_ongoing: boolean;

    @ApiProperty({
        description: 'Description',
        example: 'A brief description',
        format: 'boolean',
        required: false,
    })
    @IsString()
    description: string;
}
