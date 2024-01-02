import { IsNotEmpty, IsString } from 'class-validator';

export class SmsTemplateDTO {
    @IsNotEmpty()
    @IsString()
    format: string;
}
