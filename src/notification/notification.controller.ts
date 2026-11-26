import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthGuard } from '../common/guards/auth.guard';
import { extractUserIdFromRequest } from '../common/functions/extractUserId';
import { NotificationService } from './notification.service';
import { GetNotificationsQueryDto } from './dto/get-notifications-query.dto';

@ApiTags('notification')
@Controller('notification')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({
    summary: 'Get paginated notifications for current user',
    description:
      'Fetches notification history including sending timestamp, navigation payload, common identifier, and read status.',
  })
  @Get()
  async getUserNotifications(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetNotificationsQueryDto,
  ) {
    const userId = extractUserIdFromRequest(req);
    return await this.notificationService.getUserNotifications({
      userId,
      query,
      res,
    });
  }

  @ApiOperation({
    summary: 'Get count of unread notifications',
    description:
      'Returns total count of unread notifications for badge counter in UI.',
  })
  @Get('unread-count')
  async getUnreadCount(@Req() req: Request, @Res() res: Response) {
    const userId = extractUserIdFromRequest(req);
    return await this.notificationService.getUnreadCount({ userId, res });
  }

  @ApiOperation({
    summary: 'Mark all notifications as read',
    description:
      'Bulk updates all unread notifications for the user to read status.',
  })
  @Patch('read-all')
  async markAllAsRead(@Req() req: Request, @Res() res: Response) {
    const userId = extractUserIdFromRequest(req);
    return await this.notificationService.markAllAsRead({ userId, res });
  }

  @ApiOperation({
    summary: 'Mark individual notification as read',
    description:
      'Marks a specific notification as read and records read timestamp.',
  })
  @ApiParam({ name: 'id', description: 'Notification unique ID' })
  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userId = extractUserIdFromRequest(req);
    return await this.notificationService.markAsRead({
      userId,
      notificationId: id,
      res,
    });
  }

  @ApiOperation({
    summary: 'Delete a notification',
    description: 'Deletes a notification owned by the current user.',
  })
  @ApiParam({ name: 'id', description: 'Notification unique ID' })
  @Delete(':id')
  async deleteNotification(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userId = extractUserIdFromRequest(req);
    return await this.notificationService.deleteNotification({
      userId,
      notificationId: id,
      res,
    });
  }
}
