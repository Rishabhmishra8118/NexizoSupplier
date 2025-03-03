export interface LineItem {
  id: string;
  quantity: number;
  uom: string;
  productName: string;
  brand?: string;
}

export interface QuoteLineItem {
  lineItemId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  itemPrice: number;
  gstPercentage: number;
}

export interface Address {
  addressId: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  cityStateDisplayString: string;
}

export interface SalesOrder {
  salesOrderId: string;
  orderNumber: string;
  companyName: string;
  expectedDeliveryDate: number;
  deliveryDate: number;
  totalItemPrice: number;
  gstAmount: number;
  totalPrice: number;
  salesOrderStatus: string;
  paymentTerm: {
    advance: number | null;
    credit: number | null;
    creditDays: number | null;
    displayName: string;
  };
  pickupAddress: Address;
  buyerBillingAddress: Address;
  shippingAddress: Address;
  vendorBillingAddress: Address;
  assigneeName: string;
  instructions: string;
  notes: string;
  poNumber: string | null;
  poDate: number | null;
}

export interface Enquiry {
  shortId: string;
  salesEnquiryId: string;
  minBuyerDto: {
    companyName: string;
    state: string;
  };
  lineItemDtoList: Array<LineItem>;
  enquiryStatus: string;
  dateCreated: number;
  buyerNotes: string;
  expDeliveryDate: number;
  pocInfo?: {
    pocName: string;
  };
  statusDisplayValue: string;
  statusHistory: Array<{
    dateCreated: number;
    status: string;
    remarks: string;
  }>;
  buyerQuoteDto?: {
    totalPrice: number;
    gstPrice: number;
    totalItemPrice: number;
    quoteStatus: string;
    quoteApprovalStatus: string;
    expDeliveryDate: number;
    lineItemDtoList: Array<QuoteLineItem>;
    paymentTermDto: {
      advance: number;
      credit: number | null;
      displayName: string;
    };
    billingAddressDto: {
      addressLine1: string;
      addressLine2: string;
      city: string;
      state: string;
      pinCode: string;
    };
  };
  salesOrderDto?: SalesOrder;
  shippingAddress?: Address;
  billingAddress?: Address;
}

export interface Employee {
  fullName: string;
  emails: string[];
  mobileNumbers: string[];
  employeeId: string;
}
