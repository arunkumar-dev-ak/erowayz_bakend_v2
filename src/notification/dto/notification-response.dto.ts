import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class NotificationResponseDto {
  @ApiProperty({ description: 'Notification unique ID' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'User ID of the receiver' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification content text' })
  @IsString()
  content: string;

  @ApiProperty({
    description:
      'Common identifier for screen navigations (e.g. NEW_ORDER, SERVICE_BOOKING, etc.)',
    example: 'NEW_ORDER',
  })
  @IsString()
  identifier: string;

  @ApiPropertyOptional({
    description:
      'Action payload containing screen route target and reference IDs (e.g. { screen: "ORDER_DETAILS", orderId: "..." })',
  })
  @IsOptional()
  payload?: any;

  @ApiProperty({ description: 'Read status flag' })
  @IsBoolean()
  isRead: boolean;

  @ApiPropertyOptional({ description: 'Timestamp when notification was read' })
  @IsOptional()
  @IsDate()
  readAt?: Date | null;

  @ApiProperty({ description: 'Timestamp when notification was dispatched' })
  @IsDate()
  sentAt: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @IsDate()
  updatedAt: Date;
}

export class UnreadCountResponseDto {
  @ApiProperty({ description: 'Count of unread notifications', example: 3 })
  @IsInt()
  @Min(0)
  unreadCount: number;
}
