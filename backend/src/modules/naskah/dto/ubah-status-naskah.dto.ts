import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { StatusNaskah } from '@prisma/client';

export const UbahStatusNaskahSchema = z.object({
  status: z.nativeEnum(StatusNaskah, {
    errorMap: () => ({ message: 'Status naskah tidak valid' }),
  }),
});

export class UbahStatusNaskahDto {
  @ApiProperty({
    enum: StatusNaskah,
    description: 'Status baru naskah',
  })
  status!: StatusNaskah;
}
