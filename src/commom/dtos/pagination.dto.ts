import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
    @ApiProperty({default : 10, description: 'How many rwos do you need'})
    @IsOptional()
    @IsPositive()
    @Type(() => Number) //Conversetion
    limit? : number;

    @ApiProperty({default : 0, description: 'How many rwos do you want skip'})
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    offset? : number;
}