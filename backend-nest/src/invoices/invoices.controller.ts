import {
  Controller,
  Post,
  Delete,
  Get,
  Patch,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Body,
  UseGuards,
  Param,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { AllInvoiceItemsDTO, AllInvoicesDTO, InvoiceCompleteDTO, ItemCallDTO, updateCallDTO } from './dto/invoices.dto';
import { CurrentUserId } from '../users/decorators/current-user-id.decorater';
import { InvoiceLogger } from '../logger/invoice-logger.service';
import { AuthGuard } from '../users/guards/auth.guard';

@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly logger: InvoiceLogger,
  ) {}

  @Post('addItemToCard')
  @UseGuards(AuthGuard)
  async createItem(
    @Body() item: ItemCallDTO,
    @CurrentUserId() userId: string,
  ): Promise<{ message: string }> {
    try {
      const success = await this.invoicesService.addItem(
        userId,
        item.productId,
        item.quantity,
      );

      if (!success) {
        throw new BadRequestException('Item could not be added');
      }

      return { message: 'Item added successfully to Invoice' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[InvoicesController] createItem Error: ${message}`);
      throw new InternalServerErrorException(message);
    }
  }

  @Patch('updateItemQuantity')
  @UseGuards(AuthGuard)
  async updateInvoiceItemData(
    @Body() body: updateCallDTO,
  ): Promise<{ message: string }> {
    try {
      const success = await this.invoicesService.updateCartItemQuantity(
        body.invoiceId,
        body.productId,
        body.quantity,
      );

      if (!success) {
        this.logger.warn(
          `[InvoicesController] updateInvoiceItemData: Problem updating Invoice ${body.invoiceId}`,
        );
        throw new BadRequestException('Problem updating invoice item');
      }

      this.logger.log(
        `[InvoicesController] updateInvoiceItemData: Item updated for Invoice ID ${body.invoiceId}`,
      );

      return { message: 'Invoice Item updated successfully' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[InvoicesController] updateInvoiceItemData Error: ${message}`);
      throw new InternalServerErrorException(message);
    }
  }

  @Patch('buyShoppingcard/:invoiceId')
  @UseGuards(AuthGuard)
  async buyShoppingcard(
    @Param('invoiceId') invoiceId: string,
  ): Promise<{ message: string }> {
    try {
      const success = await this.invoicesService.markAsBought(invoiceId);

      if (!success) {
        this.logger.warn(`[InvoicesController] buyShoppingcard: Invoice ${invoiceId} could not be marked as bought`);
        throw new BadRequestException('Could not buy the invoice');
      }

      this.logger.log(`[InvoicesController] buyShoppingcard: Invoice ${invoiceId} purchased`);
      return { message: 'Invoice updated successfully' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[InvoicesController] buyShoppingcard Error: ${message}`);
      throw new InternalServerErrorException(message);
    }
  }

  @Delete('cardItem/:cardItemId')
  @UseGuards(AuthGuard)
  async deleteCartItem(
    @Param('cardItemId') cardItemId: string,
  ): Promise<{ message: string }> {
    try {
        await this.invoicesService.deleteCartItem(cardItemId);
        this.logger.log(`[InvoicesController] deleteCartItem: Cart item ${cardItemId} deleted`);
        return { message: 'Cart item deleted successfully' };
        } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        this.logger.error(`[InvoicesController] deleteCartItem Error: ${message}`);

        // optional: prüfen, ob der Error wegen "nicht gefunden" ist
        if (message.includes('not found')) {
            throw new NotFoundException(message);
        }

        throw new InternalServerErrorException(message);
    }
  }

  @Get('shoppingcard/:userid')
  @UseGuards(AuthGuard)
  async getShoppingcard(
    @Param('userid') cardUserId: string,
    @CurrentUserId() userId: string,
  ): Promise<InvoiceCompleteDTO> {
    try {
      if (cardUserId !== userId) {
        this.logger.warn(
          `[InvoicesController] getShoppingcard: Access denied for User ${cardUserId}`,
        );
        throw new ForbiddenException('Access denied');
      }

      this.logger.log(`[InvoicesController] getShoppingcard: Fetching invoice for user ${userId}`);
      const invoice = await this.invoicesService.createInvoice(userId);
      return await this.invoicesService.AllInvoiceItems(invoice.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[InvoicesController] getShoppingcard Error: ${message}`);
      throw new InternalServerErrorException(message);
    }
  }

  @Get('allInvoicesUser/:userid')
  @UseGuards(AuthGuard)
  async getAllInvoicesUser(
    @Param('userid') cardUserId: string,
    @CurrentUserId() userId: string,
  ): Promise<AllInvoicesDTO[]> {
    try {
      if (cardUserId !== userId) {
        this.logger.warn(
          `[InvoicesController] getAllInvoicesUser: Access denied for User ${cardUserId}`,
        );
        throw new ForbiddenException('Access denied');
      }

      return await this.invoicesService.findAllByUser(cardUserId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[InvoicesController] getAllInvoicesUser Error: ${message}`);
      throw new InternalServerErrorException(message);
    }
  }

  @Get('shoppingcard/:invoiceId/:userId')
  @UseGuards(AuthGuard)
  async getInvoiceItems(
    @Param('invoiceId') invoiceId: string,
    @Param('userId') userIdParam: string,
    @CurrentUserId() currentUserId: string,
  ): Promise<InvoiceCompleteDTO> {
    try {
      if (userIdParam !== currentUserId) {
        this.logger.warn(`[InvoicesController] getInvoiceItems: Access denied for User ${userIdParam}`);
        throw new ForbiddenException('Access denied');
      }

      this.logger.log(`[InvoicesController] getInvoiceItems: Fetching items for invoice ${invoiceId}`);
      return await this.invoicesService.AllInvoiceItems(invoiceId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`[InvoicesController] getInvoiceItems Error: ${message}`);
      throw new InternalServerErrorException(message);
    }
  }
}