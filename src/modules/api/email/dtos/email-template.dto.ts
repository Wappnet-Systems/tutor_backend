import { IsNotEmpty, IsString } from 'class-validator';

export class EmailTemplateDTO {
    @IsNotEmpty()
    @IsString()
    subject: string;

    @IsNotEmpty()
    @IsString()
    format: string;
}
