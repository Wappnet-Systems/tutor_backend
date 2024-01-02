import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RequestStatusType } from 'src/utils/constant';

export class UpdateApprovalRequestDTO {
    @ApiProperty({
        description: '1 ==> Accepted, 2 ==> Rejected',
        example: '1',
        format: 'number',
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    status: RequestStatusType;

    @ApiProperty({
        description: 'Remarks',
        example: 'Rejected, Please add education details',
        format: 'string',
        required: true,
    })
    @IsOptional()
    @IsString()
    remarks: string;
}
