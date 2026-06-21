import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsString, Min, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(3)
  description!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  unitPrice!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock!: number;

  @IsString()
  @MinLength(2)
  category!: string;
}
