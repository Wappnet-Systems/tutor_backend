import { IsDate, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateConversationDto {
    @IsNotEmpty()
    @IsNumber()
    tutor_user_id: number;

    @IsNotEmpty()
    @IsNumber()
    student_user_id: number;

    @IsNotEmpty()
    @IsNumber()
    booking_id: number;

    @IsNotEmpty()
    @IsDate()
    conversation_end_date: Date;
}
