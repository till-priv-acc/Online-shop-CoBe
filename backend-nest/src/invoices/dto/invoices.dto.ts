
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
    productPicture?: string | null;

    constructor(partial: Partial<AllInvoiceItemsDTO>) {
    Object.assign(this, partial);
  }
}

export class InvoiceCompleteDTO {
    id!: string;
    totalPrice?: number;
    purchasedAt?: string;
    isBought!: string;
    invoiceItems!: AllInvoiceItemsDTO[];

    constructor(partial: Partial<InvoiceCompleteDTO>) {
    Object.assign(this, partial);
  }
}

export class ItemCallDTO {
  productId!: string;
  quantity!: number;

  constructor(partial: Partial<ItemCallDTO>) {
    Object.assign(this, partial);
  }
}

export class updateCallDTO {
  invoiceId!: string;
  productId!: string;
  quantity!: number;

  constructor(partial: Partial<updateCallDTO>) {
    Object.assign(this, partial);
  }
}