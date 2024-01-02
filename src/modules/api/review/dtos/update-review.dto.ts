import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReviewDTO {
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
}
