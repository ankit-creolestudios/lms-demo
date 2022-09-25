export interface IOrder {
    _id: string;
    paymentDetails: Record<string, any>[];
    status: string;
    amount: number;
    date: Date;
    packages: IPackage[];
    contact: Contact;
    __v: number;
    residentialAddress: IResidentialAddress;
    billingAddress: IBillingAddress;
}

export interface Amount {
    currency_code: string;
    value: string;
}

export interface Payee {
    email_address: string;
    merchant_id: string;
}

export interface StatusDetails {
    reason: string;
}

export interface Amount2 {
    currency_code: string;
    value: string;
}

export interface SellerProtection {
    status: string;
    dispute_categories: string[];
}

export interface Capture {
    id: string;
    status: string;
    status_details: StatusDetails;
    amount: Amount2;
    final_capture: boolean;
    seller_protection: SellerProtection;
    create_time: Date;
    update_time: Date;
}

export interface Payments {
    captures: Capture[];
}

export interface PurchaseUnit {
    reference_id: string;
    amount: Amount;
    payee: Payee;
    soft_descriptor: string;
    payments: Payments;
}

export interface Name {
    _id: string;
    surname: string;
}

export interface Payer {
    _id: string;
    name: Name;
    email: string;
    payerId: string;
}

export interface Paypal {
    purchaseUnit: PurchaseUnit[];
    _id: string;
    orderId: string;
    billingToken?: any;
    facilitatorAccessToken: string;
    paymentSource: string;
    payer: Payer;
}

// export interface PaymentDetails {
//     _id: string;
//     paypal: Paypal;
// }

export interface IPackage {
    taxes: [];
    price: number;
    packageId: string;
    upsoldToPackageId: string;
    discountValue?: number;
    discountType: string;
    oldPrice?: number;
    taxValue?: number;
    taxLabel?: string;
}

export interface Contact {
    email: string;
    firstName: string;
    lastName: string;
}

export interface AutomaticPaymentMethods {
    enabled: boolean;
}

export interface Address {
    city?: any;
    country: string;
    line1?: any;
    line2?: any;
    postal_code: string;
    state?: any;
}

export interface BillingDetails {
    address: Address;
    email?: any;
    name?: any;
    phone?: any;
}

export interface Metadata {
    cartId: string;
}

export interface Outcome {
    network_status: string;
    reason?: any;
    risk_level: string;
    risk_score: number;
    seller_message: string;
    type: string;
}

export interface Checks {
    address_line1_check?: any;
    address_postal_code_check: string;
    cvc_check: string;
}

export interface Card {
    brand: string;
    checks: Checks;
    country: string;
    exp_month: number;
    exp_year: number;
    fingerprint: string;
    funding: string;
    installments?: any;
    last4: string;
    mandate?: any;
    network: string;
    three_d_secure?: any;
    wallet?: any;
}

export interface PaymentMethodDetails {
    card: Card;
    type: string;
}

export interface Refunds {
    object: string;
    data: any[];
    has_more: boolean;
    total_count: number;
    url: string;
}

export interface Datum {
    id: string;
    object: string;
    amount: number;
    amount_captured: number;
    amount_refunded: number;
    application?: any;
    application_fee?: any;
    application_fee_amount?: any;
    balance_transaction: string;
    billing_details: BillingDetails;
    calculated_statement_descriptor: string;
    captured: boolean;
    created: number;
    currency: string;
    customer?: any;
    description?: any;
    destination?: any;
    dispute?: any;
    disputed: boolean;
    failure_balance_transaction?: any;
    failure_code?: any;
    failure_message?: any;
    invoice?: any;
    livemode: boolean;
    metadata: Metadata;
    on_behalf_of?: any;
    order?: any;
    outcome: Outcome;
    paid: boolean;
    payment_intent: string;
    payment_method: string;
    payment_method_details: PaymentMethodDetails;
    receipt_email?: any;
    receipt_number?: any;
    receipt_url: string;
    refunded: boolean;
    refunds: Refunds;
    review?: any;
    shipping?: any;
    source?: any;
    source_transfer?: any;
    statement_descriptor?: any;
    statement_descriptor_suffix?: any;
    status: string;
    transfer_data?: any;
    transfer_group?: any;
}

export interface Charges {
    object: string;
    data: Datum[];
    has_more: boolean;
    total_count: number;
    url: string;
}

export interface Metadata2 {
    cartId: string;
}

export interface Card2 {
    installments?: any;
    mandate_options?: any;
    network?: any;
    request_three_d_secure: string;
}

export interface PaymentMethodOptions {
    card: Card2;
}

export interface Stripe {
    id: string;
    object: string;
    amount: number;
    amount_capturable: number;
    amount_received: number;
    application?: any;
    application_fee_amount?: any;
    automatic_payment_methods: AutomaticPaymentMethods;
    canceled_at?: any;
    cancellation_reason?: any;
    capture_method: string;
    charges: Charges;
    client_secret: string;
    confirmation_method: string;
    created: number;
    currency: string;
    customer?: any;
    description?: any;
    invoice?: any;
    last_payment_error?: any;
    livemode: boolean;
    metadata: Metadata2;
    next_action?: any;
    on_behalf_of?: any;
    payment_method: string;
    payment_method_options: PaymentMethodOptions;
    payment_method_types: string[];
    processing?: any;
    receipt_email?: any;
    review?: any;
    setup_future_usage?: any;
    shipping?: any;
    source?: any;
    statement_descriptor?: any;
    statement_descriptor_suffix?: any;
    status: string;
    transfer_data?: any;
    transfer_group?: any;
}

// export interface PaymentDetails {
//     _id: string;
//     stripe: Stripe;
// }

export interface Tax {
    _id: string;
    state: string;
    taxClass: string;
    updatedAt: Date;
    createdAt: Date;
}

export interface Contact {
    email: string;
    firstName: string;
    lastName: string;
}

export interface IResidentialAddress {
    streetLines: string[];
    state: string;
    country: string;
    town: string;
    zipCode: string;
}

export interface IBillingAddress {
    firstName: string;
    lastName: string;
    streetLines: string[];
    state: string;
    country: string;
    town: string;
    zipCode: string;
}
