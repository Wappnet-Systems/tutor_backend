import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TutorSubjectDTO {
    @ApiProperty({
        description: 'Category Id',
        example: '1',
        format: 'number',
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    category_id: number;

    @ApiProperty({
        description: 'Subject Ids',
        example: '1,2,3,4',
        format: 'string',
        required: true,
    })
    @IsString()
    subject_ids: string;
}
