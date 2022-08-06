import { IsString, MinLength } from "class-validator";

export class NewMesageDto{
    @IsString()
    @MinLength(1)
    message:string;
}