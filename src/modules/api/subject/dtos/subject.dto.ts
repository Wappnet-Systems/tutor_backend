import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubjectDTO {
    @ApiProperty({
        description: 'Subject Name',
        example: 'Mathematics',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    subject_name: string;

    @ApiProperty({
        description: 'Category Id',
        example: '1',
        format: 'number',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    subject_category_id: string;
}
