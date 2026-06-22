// Enums
export enum UserRole {
  SuperAdmin = 'SuperAdmin',
  Admin = 'Admin',
  Manager = 'Manager',
  Accountant = 'Accountant',
  SalesAgent = 'SalesAgent',
  Viewer = 'Viewer',
}

export enum UserStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Suspended = 'Suspended',
  PendingVerification = 'PendingVerification',
}

export enum InvoiceStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  PartiallyPaid = 'PartiallyPaid',
  Paid = 'Paid',
  Overdue = 'Overdue',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded',
}

export enum CustomerType {
  Individual = 'Individual',
  Business = 'Business',
  Government = 'Government',
}

export enum CustomerStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Blocked = 'Blocked',
  Pending = 'Pending',
}

export enum ProductType {
  Goods = 'Goods',
  Services = 'Services',
  Digital = 'Digital',
  Subscription = 'Subscription',
}

export enum UnitOfMeasure {
  Pieces = 'Pieces',
  Kilograms = 'Kilograms',
  Grams = 'Grams',
  Liters = 'Liters',
  Milliliters = 'Milliliters',
  Meters = 'Meters',
  SquareMeters = 'SquareMeters',
  CubicMeters = 'CubicMeters',
  Dozens = 'Dozens',
  Boxes = 'Boxes',
  Bags = 'Bags',
  Hours = 'Hours',
  Days = 'Days',
  Months = 'Months',
  Sets = 'Sets',
  Pairs = 'Pairs',
  Other = 'Other',
}

export enum PaymentMethod {
  Cash = 'Cash',
  BankTransfer = 'BankTransfer',
  Cheque = 'Cheque',
  UPI = 'UPI',
  CreditCard = 'CreditCard',
  DebitCard = 'DebitCard',
  NetBanking = 'NetBanking',
  NEFT = 'NEFT',
  RTGS = 'RTGS',
  IMPS = 'IMPS',
  Other = 'Other',
}

export enum PaymentStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Failed = 'Failed',
  Refunded = 'Refunded',
}

export enum DiscountType {
  None = 'None',
  Percentage = 'Percentage',
  FixedAmount = 'FixedAmount',
}

export enum PurchaseOrderStatus {
  Draft = 'Draft',
  Ordered = 'Ordered',
  PartiallyReceived = 'PartiallyReceived',
  Received = 'Received',
  Cancelled = 'Cancelled',
}

export enum SupplierStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Blocked = 'Blocked',
}

export enum ExpenseCategory {
  Office = 'Office',
  Travel = 'Travel',
  Salaries = 'Salaries',
  Marketing = 'Marketing',
  Utilities = 'Utilities',
  Rent = 'Rent',
  Software = 'Software',
  Logistics = 'Logistics',
  Maintenance = 'Maintenance',
  Other = 'Other',
}

export enum InventoryMovementType {
  Purchase = 'Purchase',
  Sale = 'Sale',
  Adjustment = 'Adjustment',
  Return = 'Return',
  Transfer = 'Transfer',
  Damaged = 'Damaged',
  Opening = 'Opening',
}

export enum InsightType {
  SalesTrend = 'SalesTrend',
  TopCustomer = 'TopCustomer',
  TopProduct = 'TopProduct',
  ProfitAlert = 'ProfitAlert',
  StockAlert = 'StockAlert',
  PaymentReminder = 'PaymentReminder',
  SeasonalPattern = 'SeasonalPattern',
  AnomalyDetection = 'AnomalyDetection',
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Address
export interface AddressDto {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  stateCode: string;
  pinCode: string;
  country: string;
}

// Auth
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  createCompany?: boolean;
  companyName?: string;
  gstin?: string;
  phoneNumber?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: string;
  user: UserDto;
}

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string;
  role: UserRole;
  status: UserStatus;
  tenantId: string;
  lastLoginAt?: string;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: UserRole;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: UserRole;
  status?: UserStatus;
}

// Customer
export interface CustomerDto {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  customerType: CustomerType;
  status: CustomerStatus;
  gstin?: string;
  pan?: string;
  isGSTRegistered: boolean;
  billingAddress: AddressDto;
  shippingAddress: AddressDto;
  shippingSameAsBilling: boolean;
  creditLimit?: number;
  paymentTermDays?: number;
  notes?: string;
  tags?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerListDto {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  customerType: CustomerType;
  status: CustomerStatus;
  gstin?: string;
  billingCity?: string;
  billingState?: string;
  outstandingBalance: number;
  createdAt: string;
}

export interface CreateCustomerDto {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  customerType: CustomerType;
  gstin?: string;
  pan?: string;
  billingAddress: AddressDto;
  shippingAddress?: AddressDto;
  shippingSameAsBilling?: boolean;
  creditLimit?: number;
  paymentTermDays?: number;
  notes?: string;
  tags?: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {
  status?: CustomerStatus;
}

export interface CustomerStatisticsDto {
  customerId: string;
  name: string;
  totalInvoices: number;
  totalRevenue: number;
  outstandingBalance: number;
  averageInvoiceValue: number;
  lastInvoiceDate?: string;
  totalDaysOverdue: number;
}

// Product
export interface ProductDto {
  id: string;
  name: string;
  description?: string;
  sku: string;
  hsnCode: string;
  barcode?: string;
  productType: ProductType;
  unit: UnitOfMeasure;
  purchasePrice: number;
  salePrice: number;
  mrp?: number;
  gstRate: number;
  cessRate?: number;
  trackInventory: boolean;
  currentStock: number;
  minimumStock: number;
  reorderQty?: number;
  storageLocation?: string;
  imageUrl?: string;
  isActive: boolean;
  categoryId?: string;
  categoryName?: string;
  createdAt: string;
}

export interface ProductListDto {
  id: string;
  name: string;
  sku: string;
  hsnCode: string;
  productType: ProductType;
  salePrice: number;
  gstRate: number;
  currentStock: number;
  minimumStock: number;
  isLowStock: boolean;
  isActive: boolean;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  sku: string;
  hsnCode: string;
  barcode?: string;
  productType: ProductType;
  unit: UnitOfMeasure;
  purchasePrice: number;
  salePrice: number;
  mrp?: number;
  gstRate: number;
  cessRate?: number;
  trackInventory: boolean;
  openingStock?: number;
  minimumStock: number;
  reorderQty?: number;
  storageLocation?: string;
  categoryId?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  isActive?: boolean;
}

// Invoice
export interface InvoiceItemDto {
  id?: string;
  sortOrder: number;
  productId: string;
  productName: string;
  hsnCode: string;
  description?: string;
  quantity: number;
  unit: UnitOfMeasure;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxableAmount: number;
  gstRate: number;
  igstRate: number;
  igstAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  cessRate: number;
  cessAmount: number;
  totalAmount: number;
}

export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  customerId: string;
  customerName: string;
  customerGSTIN?: string;
  billingAddress?: AddressDto;
  shippingAddress?: AddressDto;
  isInterState: boolean;
  placeOfSupply: string;
  placeOfSupplyCode: string;
  items: InvoiceItemDto[];
  subTotal: number;
  discountAmount: number;
  discountType: DiscountType;
  discountPercent?: number;
  taxableAmount: number;
  igstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  cessAmount: number;
  totalTaxAmount: number;
  roundOff: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  notes?: string;
  termsAndConditions?: string;
  shippingDetails?: string;
  vehicleNumber?: string;
  eWayBillNumber?: string;
  irn?: string;
  payments?: PaymentDto[];
  createdAt: string;
}

export interface InvoiceListDto {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerId: string;
  customerName: string;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  isOverdue: boolean;
}

export interface CreateInvoiceItemDto {
  productId: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
}

export interface CreateInvoiceDto {
  invoiceDate: string;
  dueDate?: string;
  customerId: string;
  isInterState: boolean;
  placeOfSupply: string;
  placeOfSupplyCode: string;
  items: CreateInvoiceItemDto[];
  discountType: DiscountType;
  discountPercent?: number;
  discountAmount?: number;
  notes?: string;
  termsAndConditions?: string;
  shippingDetails?: string;
  vehicleNumber?: string;
  eWayBillNumber?: string;
  saveAsDraft: boolean;
}

export interface UpdateInvoiceDto {
  invoiceDate?: string;
  dueDate?: string;
  isInterState?: boolean;
  placeOfSupply?: string;
  placeOfSupplyCode?: string;
  items?: CreateInvoiceItemDto[];
  discountType?: DiscountType;
  discountPercent?: number;
  discountAmount?: number;
  notes?: string;
  termsAndConditions?: string;
  eWayBillNumber?: string;
}

// Payment
export interface PaymentDto {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  invoiceId?: string;
  invoiceNumber?: string;
  customerId?: string;
  customerName?: string;
  referenceNumber?: string;
  bankName?: string;
  notes?: string;
  isRefund: boolean;
  createdAt: string;
}

export interface PaymentListDto {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  customerName?: string;
  invoiceNumber?: string;
  isRefund: boolean;
}

export interface RecordPaymentDto {
  invoiceId?: string;
  purchaseOrderId?: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  referenceNumber?: string;
  bankName?: string;
  notes?: string;
}

// Purchase Order
export interface PurchaseOrderItemDto {
  id?: string;
  sortOrder: number;
  productId: string;
  productName: string;
  hsnCode: string;
  description?: string;
  orderedQty: number;
  receivedQty: number;
  unit: UnitOfMeasure;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxableAmount: number;
  gstRate: number;
  igstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  cessAmount: number;
  totalAmount: number;
}

export interface PurchaseOrderDto {
  id: string;
  poNumber: string;
  poDate: string;
  expectedDeliveryDate?: string;
  receivedDate?: string;
  status: PurchaseOrderStatus;
  supplierId: string;
  supplierName: string;
  supplierGSTIN?: string;
  supplierInvoiceNumber?: string;
  supplierInvoiceDate?: string;
  items: PurchaseOrderItemDto[];
  subTotal: number;
  discountAmount: number;
  taxableAmount: number;
  igstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  cessAmount: number;
  totalTaxAmount: number;
  roundOff: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  isInterState: boolean;
  notes?: string;
  payments?: PaymentDto[];
  createdAt: string;
}

export interface PurchaseOrderListDto {
  id: string;
  poNumber: string;
  poDate: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
}

export interface CreatePurchaseOrderItemDto {
  productId: string;
  description?: string;
  orderedQty: number;
  unitPrice: number;
  discountPercent: number;
}

export interface CreatePurchaseOrderDto {
  poDate: string;
  expectedDeliveryDate?: string;
  supplierId: string;
  isInterState: boolean;
  supplierInvoiceNumber?: string;
  supplierInvoiceDate?: string;
  items: CreatePurchaseOrderItemDto[];
  notes?: string;
  saveAsDraft: boolean;
}

export interface UpdatePurchaseOrderDto {
  poDate?: string;
  expectedDeliveryDate?: string;
  isInterState?: boolean;
  supplierInvoiceNumber?: string;
  supplierInvoiceDate?: string;
  items?: CreatePurchaseOrderItemDto[];
  notes?: string;
}

// Supplier
export interface SupplierDto {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  gstin?: string;
  pan?: string;
  status: SupplierStatus;
  address: AddressDto;
  bankName?: string;
  bankAccountNumber?: string;
  bankIFSC?: string;
  paymentTermDays?: number;
  notes?: string;
  createdAt: string;
}

export interface SupplierListDto {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: SupplierStatus;
  gstin?: string;
  city?: string;
}

export interface CreateSupplierDto {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  gstin?: string;
  pan?: string;
  address: AddressDto;
  bankName?: string;
  bankAccountNumber?: string;
  bankIFSC?: string;
  paymentTermDays?: number;
  notes?: string;
}

export interface UpdateSupplierDto extends Partial<CreateSupplierDto> {
  status?: SupplierStatus;
}

// Expense
export interface ExpenseDto {
  id: string;
  title: string;
  category: ExpenseCategory;
  expenseDate: string;
  amount: number;
  gstAmount?: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  vendorName?: string;
  referenceNumber?: string;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface ExpenseListDto {
  id: string;
  title: string;
  category: ExpenseCategory;
  expenseDate: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  vendorName?: string;
  referenceNumber?: string;
}

export interface CreateExpenseDto {
  title: string;
  category: ExpenseCategory;
  expenseDate: string;
  amount: number;
  gstAmount?: number;
  paymentMethod: PaymentMethod;
  vendorName?: string;
  referenceNumber?: string;
  notes?: string;
}

export interface UpdateExpenseDto extends CreateExpenseDto {}

// Tenant
export interface TenantDto {
  id: string;
  businessName: string;
  businessLogo?: string;
  legalName?: string;
  gstin?: string;
  pan?: string;
  tan?: string;
  cin?: string;
  email?: string;
  phone?: string;
  website?: string;
  address: AddressDto;
  currencyCode: string;
  invoicePrefix: string;
  purchasePrefix: string;
  financialYearStart: string;
  isGSTRegistered: boolean;
  bankName?: string;
  bankAccountNumber?: string;
  bankIFSC?: string;
  bankBranch?: string;
  upiId?: string;
}

export interface UpdateTenantDto {
  businessName?: string;
  legalName?: string;
  gstin?: string;
  pan?: string;
  tan?: string;
  cin?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: AddressDto;
  invoicePrefix?: string;
  purchasePrefix?: string;
  financialYearStart?: string;
  isGSTRegistered?: boolean;
  bankName?: string;
  bankAccountNumber?: string;
  bankIFSC?: string;
  bankBranch?: string;
  upiId?: string;
}

// Dashboard
export interface DashboardSummaryDto {
  totalRevenue: number;
  totalRevenuePrev: number;
  revenueGrowthPct: number;
  totalExpenses: number;
  netProfit: number;
  outstandingReceivables: number;
  outstandingPayables: number;
  totalCustomers: number;
  newCustomersThisPeriod: number;
  totalInvoices: number;
  overdueInvoices: number;
  lowStockProducts: number;
  recentInsights: AIInsightDto[];
}

// AI Insights
export interface AIInsightDto {
  id: string;
  insightType: InsightType;
  title: string;
  description: string;
  recommendation?: string;
  impactValue?: number;
  isRead: boolean;
  generatedAt: string;
}

// Audit Log
export interface AuditLogDto {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValues?: string;
  newValues?: string;
  changedProperties?: string;
  ipAddress?: string;
  userId: string;
  userName: string;
  createdAt: string;
}

// Inventory
export interface InventoryMovementDto {
  id: string;
  movementType: InventoryMovementType;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  unitCost: number;
  totalCost: number;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  productName: string;
  createdAt: string;
  performedByName: string;
}

export interface StockAdjustmentDto {
  quantity: number;
  movementType: InventoryMovementType;
  notes?: string;
}

export interface StockValuationDto {
  totalStockValue: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  items: StockValuationItemDto[];
}

export interface StockValuationItemDto {
  productId: string;
  name: string;
  sku: string;
  currentStock: number;
  purchasePrice: number;
  stockValue: number;
  isLowStock: boolean;
}

// Notifications
export interface NotificationLogDto {
  id: string;
  type: string;
  status: string;
  subject: string;
  recipient: string;
  retryCount: number;
  sentAt?: string;
  errorMessage?: string;
  createdAt: string;
}

// Product Category
export interface ProductCategoryDto {
  id: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  parentCategoryName?: string;
  createdAt: string;
}

export interface CreateProductCategoryDto {
  name: string;
  description?: string;
  parentCategoryId?: string;
}

export interface UpdateProductCategoryDto {
  name: string;
  description?: string;
  parentCategoryId?: string;
}

// Select option (for search dropdowns)
export interface SelectOptionDto {
  value: string;
  label: string;
  subLabel?: string;
}

// GST
export interface GSTSummaryDto {
  month: number;
  year: number;
  taxableAmount: number;
  totalIGST: number;
  totalCGST: number;
  totalSGST: number;
  totalCess: number;
  totalTax: number;
  hsnSummary: GSTHSNSummaryDto[];
  statewiseSummary: GSTStatewiseSummaryDto[];
}

export interface GSTHSNSummaryDto {
  hsnCode: string;
  taxableAmount: number;
  igstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  totalTax: number;
}

export interface GSTStatewiseSummaryDto {
  state: string;
  stateCode: string;
  taxableAmount: number;
  igstAmount: number;
  invoiceCount: number;
}

// Pagination & filter params
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDesc?: boolean;
}

export interface InvoiceFilterParams extends PaginationParams {
  search?: string;
  status?: InvoiceStatus;
  customerId?: string;
  fromDate?: string;
  toDate?: string;
  overdueOnly?: boolean;
}

export interface CustomerFilterParams extends PaginationParams {
  search?: string;
  type?: CustomerType;
  status?: CustomerStatus;
}

export interface ProductFilterParams extends PaginationParams {
  search?: string;
  type?: ProductType;
  categoryId?: string;
  isActive?: boolean;
  lowStockOnly?: boolean;
}

export interface ExpenseFilterParams extends PaginationParams {
  search?: string;
  category?: ExpenseCategory;
  fromDate?: string;
  toDate?: string;
}

export interface PaymentFilterParams extends PaginationParams {
  invoiceId?: string;
  customerId?: string;
  fromDate?: string;
  toDate?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
}

export interface PurchaseOrderFilterParams extends PaginationParams {
  search?: string;
  status?: PurchaseOrderStatus;
  supplierId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface SupplierFilterParams extends PaginationParams {
  search?: string;
  status?: SupplierStatus;
}
