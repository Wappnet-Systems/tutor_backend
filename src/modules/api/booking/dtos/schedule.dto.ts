import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { momentUTC } from 'src/helper/date';

export class ScheduleDTO {
    @ApiProperty({
        description: 'From Date',
        example: '',
        format: 'date',
        required: true,
    })
    @IsNotEmpty()
    @Transform(({ value }) => momentUTC(value))
    @IsDate()
    from_date: Date;

    @ApiProperty({
        description: 'To Date',
        example: '',
        format: 'date',
        required: true,
    })
    @IsNotEmpty()
    @Transform(({ value }) => momentUTC(value))
    @IsDate()
    to_date: Date;

    @ApiProperty({
        description: 'Sunday = 1, Monday = 2, ...',
        example: '2',
        format: 'number',
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    week_day: number;

    @ApiProperty({
        description: 'From time',
        example: '',
        format: 'date',
        required: true,
    })
    @IsNotEmpty()
    @Transform(({ value }) => momentUTC(value))
    @IsDate()
    from_time: Date;

    @ApiProperty({
        description: 'To time',
        example: '',
        format: 'date',
        required: true,
    })
    @IsNotEmpty()
    @Transform(({ value }) => momentUTC(value))
    @IsDate()
    to_time: Date;

    @ApiProperty({
        description: 'Timezone name',
        example: 'Asia/Kolkata',
        format: 'number',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    timezone: string;
}
