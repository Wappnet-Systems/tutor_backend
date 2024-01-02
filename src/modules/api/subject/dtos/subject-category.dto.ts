import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubjectCategoryDTO {
    @ApiProperty({
        description: 'Category Name',
        example: 'Class 9 - 10',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    category_name: string;

    @ApiProperty({
        description: 'description',
        example: '',
        format: 'string',
        required: false,
    })
    @IsString()
    description: string;
}
