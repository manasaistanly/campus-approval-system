import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateBonafideDto {
    @IsNotEmpty()
    @IsUUID()
    purposeId: string;

    @IsNotEmpty()
    @IsString()
    formalLetterText: string;

    @IsNotEmpty()
    @IsString()
    deliveryMode: 'PHYSICAL' | 'DIGITAL';
}
