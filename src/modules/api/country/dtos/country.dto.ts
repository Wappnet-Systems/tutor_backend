import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CountryDTO {
    @ApiProperty({
        description: 'Country Name',
        example: 'India',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    country_name: string;
}
