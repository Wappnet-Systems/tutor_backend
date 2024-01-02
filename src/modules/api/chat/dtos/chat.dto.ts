import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ChatDto {
    @IsNotEmpty()
    @IsNumber()
    from: number;

    @IsNotEmpty()
    @IsNumber()
    to: number;

    @IsNotEmpty()
    @IsNumber()
    conversation_id: number;

    @IsNotEmpty()
    @IsString()
    message?: string;

    @IsString()
    @IsOptional()
    document?: string;

    @IsString()
    @IsOptional()
    document_type?: string;
}
