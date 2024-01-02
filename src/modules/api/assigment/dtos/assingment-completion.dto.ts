import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignmentCompletionDTO {
    @ApiProperty({
        description: 'Tutor Review',
        example: 'Tutor Review',
        format: 'string',
        required: true,
    })
    @IsString()
    tutor_review: string;
}
