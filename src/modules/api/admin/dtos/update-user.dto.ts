import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatusType } from 'src/utils/constant';

export class UpdateUserDTO {
    @ApiProperty({
        description: '1 ==> Active, 2 ==> InActive',
        example: '1',
        format: 'number',
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    status: StatusType;

    @ApiProperty({
        description: 'Remarks',
        example: 'Spam',
        format: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    remarks: string;
}
