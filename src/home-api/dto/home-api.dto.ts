import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'EndAfterStart', async: false })
export class EndAfterStartConstraint implements ValidatorConstraintInterface {
  validate(currentVal: string, args: ValidationArguments) {
    const obj = args.object as HomeApiDto;
    const startStr = obj.startDateTime.toISOString();
    const endStr = obj.endDateTime.toISOString();

    const isStartUTC = startStr.endsWith('Z');
    const isEndUTC = endStr.endsWith('Z');

    const start = new Date(obj.startDateTime);
    const end = new Date(obj.endDateTime);

    return isStartUTC && isEndUTC && end > start;
  }

  defaultMessage() {
    return `endDateTime must be greater than startDateTime and it is in utc format`;
  }
}

export class HomeApiDto {
  @ApiProperty({
    description: 'Start date and time of the banner',
    example: '2024-09-01T00:00:00.000Z',
    required: true,
  })
  @IsDate()
  @Validate(EndAfterStartConstraint)
  @IsNotEmpty({ message: 'StartDateTime is required' })
  startDateTime: Date;

  @ApiProperty({
    description: 'End date and time of the banner',
    example: '2024-09-01T00:00:00.000Z',
    required: true,
  })
  @IsDate()
  @IsNotEmpty({ message: 'EndDateTime is required' })
  endDateTime: Date;
}
