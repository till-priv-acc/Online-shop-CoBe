
export class AllInvoicesDTO {
    id!: string;
    totalPrice?: number;
    purchasedAt!: string;

    constructor(partial: Partial<AllInvoicesDTO>) {
    Object.assign(this, partial);
  }
}

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