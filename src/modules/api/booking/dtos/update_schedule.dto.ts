import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AvailabilityStatusType } from 'src/utils/constant';

export class UpdateScheduleDTO {
    @ApiProperty({
        description: '0 ==> Open, 2 ==> Cancelled',
        example: '2',
        format: 'number',
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    status: AvailabilityStatusType;
}
