import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FeedbackDTO {
    @ApiProperty({
        description: 'Feedback Issue',
        example: '1',
        format: 'number',
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    feedback_subject_id: number;

    @ApiProperty({
        description: 'Feedback Description',
        example: '',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({
        description: 'Other Subject',
        example: '',
        format: 'string',
        required: false,
    })
    @IsOptional()
    @IsString()
    other_subject: string;
}
