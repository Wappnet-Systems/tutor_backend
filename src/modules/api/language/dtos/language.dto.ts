import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LanguageDTO {
    @ApiProperty({
        description: 'Language',
        example: 'English',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    language: string;
}
