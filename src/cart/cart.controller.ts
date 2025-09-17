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
  Res,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/common/guards/auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { extractUserIdFromRequest } from 'src/common/functions/extractUserId';
import { AddCartDto } from './dto/add-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Roles } from 'src/common/roles/roles.docorator';
import { Role } from '@prisma/client';
import { RoleGuard } from 'src/common/guards/role.guard';
import { UpdateCartServiceDto } from './dto/update-cart-service.dto';
import { BestOfferItemDto } from './dto/bestoffer-item.dto';
import { GetCartQueryDto } from './dto/get-cart-query.dto';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get All Carts',
  })
  @Get()
  async getCart(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: GetCartQueryDto,
  ) {
    const offsetNum = Number(query.offset) || 0;
    const limitNum = Number(query.limit) || 10;
    const userId = extractUserIdFromRequest(req);

    await this.cartService.getAllCartsByUser({
      res,
      userId,
      offset: offsetNum,
      limit: limitNum,
    });
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiOperation({
    summary: 'Get CartItems with or without cartId, default as first',
  })
  @ApiQuery({
    name: 'cartId',
    type: String,
    required: false,
    description: 'Id of the cart',
  })
  @Get('cartItem')
  async getCartItems(
    @Req() req: Request,
    @Res() res: Response,
    @Query('cartId') cartId: string,
  ) {
    const userId = extractUserIdFromRequest(req);

    await this.cartService.getCartItemByUser({
      userId,
      res,
      cartId,
    });
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get CartItems by CartItem id',
  })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the cartItem' })
  @Get('cartItem/:id')
  async getCartItemsById(
    @Res() res: Response,
    @Param('id') cartItemId: string,
  ) {
    await this.cartService.getCartItemById({
      res,
      cartItemId,
    });
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add Items to the cart',
  })
  @Post('add')
  async addItemsToCart(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: AddCartDto,
  ) {
    const userId = extractUserIdFromRequest(req);

    await this.cartService.addCartItem({
      userId,
      res,
      body,
    });
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Qty in the cart',
  })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the cartItem' })
  @Patch('updateQty/:id')
  async updateItemQty(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateCartDto,
    @Param('id') cartItemId: string,
  ) {
    const userId = extractUserIdFromRequest(req);

    await this.cartService.updateCartItemQty({
      res,
      userId,
      cartItemId,
      body,
    });
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update ServiceOption in the cart',
  })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the cartItem' })
  @Patch('updateCartServiceOption/:id')
  async UpdateCartServiceOption(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateCartServiceDto,
    @Param('id') cartItemId: string,
  ) {
    const userId = extractUserIdFromRequest(req);

    await this.cartService.updateCartItemService({
      res,
      userId,
      cartItemId,
      body,
    });
  }

  @ApiOperation({
    summary: 'Check Item Best price',
  })
  @Post('checkItemPrice')
  async checkItemPrice(@Res() res: Response, @Body() body: BestOfferItemDto) {
    await this.cartService.getBestOfferForItem({
      res,
      body,
    });
  }

  @Roles(Role.CUSTOMER)
  @UseGuards(AuthGuard, RoleGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove Item in the cart',
  })
  @ApiParam({ name: 'id', type: String, description: 'The ID of the cartItem' })
  @Delete('remove/:id')
  async removeItemsFromCart(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') cartItemId: string,
  ) {
    const userId = extractUserIdFromRequest(req);
    await this.cartService.removeCartItem({
      userId,
      res,
      cartItemId,
    });
  }
}
