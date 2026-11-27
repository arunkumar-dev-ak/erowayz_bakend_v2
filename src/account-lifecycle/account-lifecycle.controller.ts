import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { extractUserIdFromRequest } from '../common/functions/extractUserId';
import { AuthGuard } from '../common/guards/auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/roles/roles.docorator';
import { AccountLifecycleService } from './account-lifecycle.service';
import { AdminHardDeleteDto } from './dto/admin-hard-delete.dto';
import { ClaimRefundDto } from './dto/claim-refund.dto';
import { GetDeletionAuditQueryDto } from './dto/get-deletion-audit-query.dto';
import { SelfDeleteAccountDto } from './dto/self-delete-account.dto';

@ApiTags('Account Lifecycle')
@Controller('account-lifecycle')
export class AccountLifecycleController {
  constructor(
    private readonly accountLifecycleService: AccountLifecycleService,
  ) {}

  @ApiOperation({
    summary: 'Self-delete account (Customer or Vendor)',
    description:
      'Initiates account self-deletion for the authenticated customer or vendor. Validates no active orders, bookings, pending payments, or locked coins exist. Invalidates all active login sessions.',
  })
  @ApiBearerAuth()
  @Roles(Role.CUSTOMER, Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('self-delete')
  async selfDelete(
    @Req() req: Request,
    @Body() body: SelfDeleteAccountDto,
  ) {
    const userId = extractUserIdFromRequest(req);
    return await this.accountLifecycleService.selfDeleteAccount({
      userId,
      reason: body?.reason,
    });
  }

  @ApiOperation({
    summary: 'Reactivate pending-deletion account',
    description:
      'Allows a customer or vendor to cancel their scheduled deletion within the grace window and reactivate their account.',
  })
  @ApiBearerAuth()
  @Roles(Role.CUSTOMER, Role.VENDOR)
  @UseGuards(AuthGuard, RoleGuard)
  @Post('reactivate')
  async reactivateAccount(@Req() req: Request) {
    const userId = extractUserIdFromRequest(req);
    return await this.accountLifecycleService.reactivatePendingAccount({
      userId,
    });
  }

  @ApiOperation({
    summary: 'Admin permanent hard delete',
    description:
      'Permanently hard-deletes a user or vendor account from the database. Checks for active in-flight transactions on both sides. If wallet coins exist, logs an audit record so refunds can be tracked.',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'User ID to permanently delete',
  })
  @ApiBody({ type: AdminHardDeleteDto, required: false })
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Delete('admin/hard-delete/:userId')
  async adminHardDelete(
    @Req() req: Request,
    @Param('userId') userId: string,
    @Body() body: AdminHardDeleteDto,
  ) {
    const adminId = extractUserIdFromRequest(req);
    return await this.accountLifecycleService.adminHardDelete({
      userId,
      adminId,
      reason: body?.reason,
    });
  }

  @ApiOperation({
    summary: 'Admin: Get deletion refund audit logs',
    description:
      'Search deleted accounts that had remaining wallet coins to review or issue refunds upon request.',
  })
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Get('admin/refund-audits')
  async getRefundAudits(@Query() query: GetDeletionAuditQueryDto) {
    return await this.accountLifecycleService.getDeletionAuditLogs({
      mobile: query.mobile,
      email: query.email,
      originalUserId: query.originalUserId,
      refundClaimed: query.refundClaimed,
      offset: query.offset,
      limit: query.limit,
    });
  }

  @ApiOperation({
    summary: 'Admin: Mark refund as claimed',
    description:
      'Marks a deletion coin refund record as claimed with optional payment/transaction notes.',
  })
  @ApiParam({
    name: 'auditId',
    type: String,
    description: 'AccountDeletionAudit ID',
  })
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Patch('admin/claim-refund/:auditId')
  async claimRefund(
    @Param('auditId') auditId: string,
    @Body() body: ClaimRefundDto,
  ) {
    return await this.accountLifecycleService.claimRefund({
      auditId,
      notes: body?.notes,
    });
  }

  @ApiOperation({
    summary: 'Admin: Manually trigger scheduled deletion batch',
    description:
      'Manually runs the batch process that cleans up accounts whose 30-day grace period has expired (hard-deletes clean accounts, permanently soft-deletes accounts with history, logs remaining wallet coins).',
  })
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Post('admin/trigger-scheduled-deletions')
  async triggerScheduledDeletions() {
    return await this.accountLifecycleService.processScheduledDeletions();
  }
}
