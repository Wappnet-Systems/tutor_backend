import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TodoDTO {
    @ApiProperty({
        description: 'Todo title',
        example: 'Todo 1',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({
        description: 'Todo Description',
        example: 'Todo Description',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    description: string;
}
