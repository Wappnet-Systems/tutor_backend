import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TutorBookingStatusType } from 'src/utils/constant';

export class UpdateBooking {
    @ApiProperty({
        description: '1 ==> Accepted, 2 ==> Rejected',
        example: '2',
        format: 'number',
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    status: TutorBookingStatusType;

    @ApiProperty({
        description: 'Rejection Reason',
        example: '',
        format: 'string',
        required: false,
    })
    @IsOptional()
    @IsString()
    rejection_reason: string;
}
