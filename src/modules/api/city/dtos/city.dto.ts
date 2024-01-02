import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CityDTO {
    @ApiProperty({
        description: 'City Name',
        example: 'Ahemdabad',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    city_name: string;

    @ApiProperty({
        description: 'Country Id',
        example: '1',
        format: 'number',
        required: true,
    })
    @IsNotEmpty()
    country_id: number;
}
