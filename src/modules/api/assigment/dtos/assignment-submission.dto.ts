import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignmentSubmissionDTO {
    @ApiProperty({
        description: 'Description',
        example: 'Description',
        format: 'string',
        required: true,
    })
    @IsString()
    description: string;

    @ApiProperty({
        type: 'file',
        description: 'File to upload',
        format: 'binary',
        required: false,
    })
    @IsOptional()
    file: Express.Multer.File;
}
