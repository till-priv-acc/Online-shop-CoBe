export class AllInvoiceItemsDTO {
    id!: string;
    seller?: string | null;
    sellerId?: string | null;
    sellerAddress!: string;
    quantity!: number ;
    productId?: string | null;
    productName?: string | null;
    productPrice?: number | null;

    constructor(partial: Partial<AllInvoiceItemsDTO>) {
    Object.assign(this, partial);
  }
}

export class InvoiceCompleteDTO {
    id!: string;
    totalPrice?: number | null;
    purchasedAt?: string | null;
    isBought!: string;
    invoiceItems!: AllInvoiceItemsDTO[];

    constructor(partial: Partial<InvoiceCompleteDTO>) {
    Object.assign(this, partial);
  }
}