import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReviewDTO {
    @ApiProperty({
        description: 'Rating',
        example: '1',
        format: 'number',
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    rating: number;

    @ApiProperty({
        description: 'Feedback',
        example: '',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    remarks: string;

    @ApiProperty({
        description: 'Booking Id',
        example: '1',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    booking_id: number;
}
