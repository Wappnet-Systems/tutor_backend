import { IsDate, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetScheduleDTO {
    @ApiProperty({
        description: 'From Date string',
        example: '',
        format: 'date',
        required: true,
    })
    @IsNotEmpty()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    from_date: Date;

    @ApiProperty({
        description: 'to Date string',
        example: '',
        format: 'date',
        required: true,
    })
    @IsNotEmpty()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    to_date: Date;
}
