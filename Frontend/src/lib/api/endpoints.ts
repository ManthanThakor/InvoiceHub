import apiClient from "./client";
import {
  ApiResponse, PagedResult,
  LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto, AuthResponseDto, UserDto,
  CustomerDto, CustomerListDto, CreateCustomerDto, UpdateCustomerDto, CustomerStatisticsDto,
  CustomerFilterParams, SelectOptionDto,
  ProductDto, ProductListDto, CreateProductDto, UpdateProductDto, ProductFilterParams,
  ProductCategoryDto, CreateProductCategoryDto, UpdateProductCategoryDto,
  InvoiceDto, InvoiceListDto, CreateInvoiceDto, UpdateInvoiceDto, InvoiceFilterParams,
  PaymentDto, PaymentListDto, RecordPaymentDto, PaymentFilterParams,
  PurchaseOrderDto, PurchaseOrderListDto, CreatePurchaseOrderDto, UpdatePurchaseOrderDto, PurchaseOrderFilterParams,
  SupplierDto, SupplierListDto, CreateSupplierDto, UpdateSupplierDto, SupplierFilterParams,
  ExpenseDto, ExpenseListDto, CreateExpenseDto, UpdateExpenseDto, ExpenseFilterParams,
  TenantDto, UpdateTenantDto, DashboardSummaryDto,
  AIInsightDto, AuditLogDto, InventoryMovementDto, StockAdjustmentDto, StockValuationDto,
  NotificationLogDto, GSTSummaryDto, CreateUserDto, UpdateUserDto, UserStatus,
} from "@/types";

// ===== AUTH =====
export const authApi = {
  login: (data: LoginDto) => apiClient.post<ApiResponse<AuthResponseDto>>("/api/auth/login", data),
  register: (data: RegisterDto) => apiClient.post<ApiResponse<AuthResponseDto>>("/api/auth/register", data),
  refresh: (refreshToken: string) => apiClient.post<ApiResponse<AuthResponseDto>>("/api/auth/refresh", refreshToken),
  logout: (refreshToken: string) => apiClient.post<ApiResponse<boolean>>("/api/auth/logout", refreshToken),
  googleLogin: (credential: string) => apiClient.post<ApiResponse<AuthResponseDto>>("/api/auth/google", credential),
  verifyEmail: (token: string) => apiClient.get<ApiResponse<boolean>>(`/api/auth/verify-email?token=${token}`),
  resendVerification: (email: string) => apiClient.post<ApiResponse<boolean>>("/api/auth/resend-verification", email),
  forgotPassword: (data: ForgotPasswordDto) => apiClient.post<ApiResponse<boolean>>("/api/auth/forgot-password", data),
  resetPassword: (data: ResetPasswordDto) => apiClient.post<ApiResponse<boolean>>("/api/auth/reset-password", data),
  changePassword: (data: ChangePasswordDto) => apiClient.post<ApiResponse<boolean>>("/api/auth/change-password", data),
};

// ===== CUSTOMERS =====
export const customerApi = {
  list: (params?: CustomerFilterParams) => apiClient.get<ApiResponse<PagedResult<CustomerListDto>>>("/api/customers", { params }),
  getById: (id: string) => apiClient.get<ApiResponse<CustomerDto>>(`/api/customers/${id}`),
  create: (data: CreateCustomerDto) => apiClient.post<ApiResponse<CustomerDto>>("/api/customers", data),
  update: (id: string, data: UpdateCustomerDto) => apiClient.put<ApiResponse<CustomerDto>>(`/api/customers/${id}`, data),
  delete: (id: string) => apiClient.delete<ApiResponse<boolean>>(`/api/customers/${id}`),
  search: (term: string) => apiClient.get<ApiResponse<SelectOptionDto[]>>("/api/customers/search", { params: { term } }),
  statistics: (id: string) => apiClient.get<ApiResponse<CustomerStatisticsDto>>(`/api/customers/${id}/statistics`),
};

// ===== PRODUCTS =====
export const productApi = {
  list: (params?: ProductFilterParams) => apiClient.get<ApiResponse<PagedResult<ProductListDto>>>("/api/products", { params }),
  getById: (id: string) => apiClient.get<ApiResponse<ProductDto>>(`/api/products/${id}`),
  create: (data: CreateProductDto) => apiClient.post<ApiResponse<ProductDto>>("/api/products", data),
  update: (id: string, data: UpdateProductDto) => apiClient.put<ApiResponse<ProductDto>>(`/api/products/${id}`, data),
  delete: (id: string) => apiClient.delete<ApiResponse<boolean>>(`/api/products/${id}`),
  search: (term: string) => apiClient.get<ApiResponse<SelectOptionDto[]>>("/api/products/search", { params: { term } }),
  lowStock: () => apiClient.get<ApiResponse<ProductListDto[]>>("/api/products/low-stock"),
  uploadImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<ApiResponse<string>>(`/api/products/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ===== PRODUCT CATEGORIES =====
export const categoryApi = {
  list: () => apiClient.get<ApiResponse<ProductCategoryDto[]>>("/api/product-categories"),
  getById: (id: string) => apiClient.get<ApiResponse<ProductCategoryDto>>(`/api/product-categories/${id}`),
  create: (data: CreateProductCategoryDto) => apiClient.post<ApiResponse<ProductCategoryDto>>("/api/product-categories", data),
  update: (id: string, data: UpdateProductCategoryDto) => apiClient.put<ApiResponse<ProductCategoryDto>>(`/api/product-categories/${id}`, data),
  delete: (id: string) => apiClient.delete<ApiResponse<boolean>>(`/api/product-categories/${id}`),
  search: (term: string) => apiClient.get<ApiResponse<SelectOptionDto[]>>("/api/product-categories/search", { params: { term } }),
};

// ===== INVOICES =====
export const invoiceApi = {
  list: (params?: InvoiceFilterParams) => apiClient.get<ApiResponse<PagedResult<InvoiceListDto>>>("/api/invoices", { params }),
  getById: (id: string) => apiClient.get<ApiResponse<InvoiceDto>>(`/api/invoices/${id}`),
  create: (data: CreateInvoiceDto) => apiClient.post<ApiResponse<InvoiceDto>>("/api/invoices", data),
  update: (id: string, data: UpdateInvoiceDto) => apiClient.put<ApiResponse<InvoiceDto>>(`/api/invoices/${id}`, data),
  send: (id: string) => apiClient.post<ApiResponse<boolean>>(`/api/invoices/${id}/send`),
  cancel: (id: string) => apiClient.post<ApiResponse<boolean>>(`/api/invoices/${id}/cancel`),
  markOverdue: () => apiClient.post<ApiResponse<boolean>>("/api/invoices/mark-overdue"),
  downloadPdf: (id: string) => apiClient.get(`/api/invoices/${id}/pdf`, { responseType: "blob" }),
  gstSummary: (month: number, year: number) => apiClient.get<ApiResponse<GSTSummaryDto>>("/api/invoices/gst-summary", { params: { month, year } }),
};

// ===== PAYMENTS =====
export const paymentApi = {
  list: (params?: PaymentFilterParams) => apiClient.get<ApiResponse<PagedResult<PaymentListDto>>>("/api/payments", { params }),
  getById: (id: string) => apiClient.get<ApiResponse<PaymentDto>>(`/api/payments/${id}`),
  create: (data: RecordPaymentDto) => apiClient.post<ApiResponse<PaymentDto>>("/api/payments", data),
  delete: (id: string) => apiClient.delete<ApiResponse<boolean>>(`/api/payments/${id}`),
};

// ===== PURCHASE ORDERS =====
export const purchaseOrderApi = {
  list: (params?: PurchaseOrderFilterParams) => apiClient.get<ApiResponse<PagedResult<PurchaseOrderListDto>>>("/api/purchase-orders", { params }),
  getById: (id: string) => apiClient.get<ApiResponse<PurchaseOrderDto>>(`/api/purchase-orders/${id}`),
  create: (data: CreatePurchaseOrderDto) => apiClient.post<ApiResponse<PurchaseOrderDto>>("/api/purchase-orders", data),
  update: (id: string, data: UpdatePurchaseOrderDto) => apiClient.put<ApiResponse<PurchaseOrderDto>>(`/api/purchase-orders/${id}`, data),
  markReceived: (id: string) => apiClient.post<ApiResponse<boolean>>(`/api/purchase-orders/${id}/mark-received`),
  cancel: (id: string) => apiClient.post<ApiResponse<boolean>>(`/api/purchase-orders/${id}/cancel`),
  downloadPdf: (id: string) => apiClient.get(`/api/purchase-orders/${id}/pdf`, { responseType: "blob" }),
};

// ===== SUPPLIERS =====
export const supplierApi = {
  list: (params?: SupplierFilterParams) => apiClient.get<ApiResponse<PagedResult<SupplierListDto>>>("/api/suppliers", { params }),
  getById: (id: string) => apiClient.get<ApiResponse<SupplierDto>>(`/api/suppliers/${id}`),
  create: (data: CreateSupplierDto) => apiClient.post<ApiResponse<SupplierDto>>("/api/suppliers", data),
  update: (id: string, data: UpdateSupplierDto) => apiClient.put<ApiResponse<SupplierDto>>(`/api/suppliers/${id}`, data),
  delete: (id: string) => apiClient.delete<ApiResponse<boolean>>(`/api/suppliers/${id}`),
  search: (term: string) => apiClient.get<ApiResponse<SelectOptionDto[]>>("/api/suppliers/search", { params: { term } }),
};

// ===== EXPENSES =====
export const expenseApi = {
  list: (params?: ExpenseFilterParams) => apiClient.get<ApiResponse<PagedResult<ExpenseListDto>>>("/api/expenses", { params }),
  getById: (id: string) => apiClient.get<ApiResponse<ExpenseDto>>(`/api/expenses/${id}`),
  create: (data: CreateExpenseDto) => apiClient.post<ApiResponse<ExpenseDto>>("/api/expenses", data),
  update: (id: string, data: UpdateExpenseDto) => apiClient.put<ApiResponse<ExpenseDto>>(`/api/expenses/${id}`, data),
  delete: (id: string) => apiClient.delete<ApiResponse<boolean>>(`/api/expenses/${id}`),
  uploadReceipt: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<ApiResponse<string>>(`/api/expenses/${id}/receipt`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// ===== TENANTS =====
export const tenantApi = {
  get: () => apiClient.get<ApiResponse<TenantDto>>("/api/tenant"),
  update: (data: UpdateTenantDto) => apiClient.put<ApiResponse<TenantDto>>("/api/tenant", data),
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<ApiResponse<string>>("/api/tenant/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteLogo: () => apiClient.delete<ApiResponse<boolean>>("/api/tenant/logo"),
  dashboard: () => apiClient.get<ApiResponse<DashboardSummaryDto>>("/api/tenant/dashboard"),
};

// ===== USERS =====
export const userApi = {
  getMe: () => apiClient.get<ApiResponse<UserDto>>("/api/users/me"),
  list: (page = 1, pageSize = 20) => apiClient.get<ApiResponse<PagedResult<UserDto>>>("/api/users", { params: { page, pageSize } }),
  getById: (id: string) => apiClient.get<ApiResponse<UserDto>>(`/api/users/${id}`),
  create: (data: CreateUserDto) => apiClient.post<ApiResponse<UserDto>>("/api/users", data),
  update: (id: string, data: UpdateUserDto) => apiClient.put<ApiResponse<UserDto>>(`/api/users/${id}`, data),
  delete: (id: string) => apiClient.delete<ApiResponse<boolean>>(`/api/users/${id}`),
  updateStatus: (id: string, status: UserStatus) => apiClient.patch<ApiResponse<boolean>>(`/api/users/${id}/status`, status, {
    headers: { "Content-Type": "application/json" },
  }),
  uploadProfilePicture: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post<ApiResponse<string>>("/api/users/me/profile-picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteProfilePicture: () => apiClient.delete<ApiResponse<boolean>>("/api/users/me/profile-picture"),
};

// ===== INSIGHTS =====
export const insightApi = {
  list: () => apiClient.get<ApiResponse<AIInsightDto[]>>("/api/insights"),
  generate: () => apiClient.post("/api/insights/generate"),
  markRead: (id: string) => apiClient.patch<ApiResponse<boolean>>(`/api/insights/${id}/read`),
  ask: (question: string) => apiClient.post<ApiResponse<string>>("/api/insights/ask", question),
};

// ===== AUDIT =====
export const auditApi = {
  list: (params?: { entityType?: string; entityId?: string; page?: number; pageSize?: number }) =>
    apiClient.get<ApiResponse<PagedResult<AuditLogDto>>>("/api/audit", { params }),
};

// ===== INVENTORY =====
export const inventoryApi = {
  movements: (params?: { productId?: string; page?: number; pageSize?: number }) =>
    apiClient.get<ApiResponse<PagedResult<InventoryMovementDto>>>("/api/inventory/movements", { params }),
  adjust: (productId: string, data: StockAdjustmentDto) =>
    apiClient.post<ApiResponse<boolean>>(`/api/inventory/products/${productId}/adjust`, data),
  lowStock: () => apiClient.get<ApiResponse<ProductListDto[]>>("/api/inventory/low-stock"),
  valuation: () => apiClient.get<ApiResponse<StockValuationDto>>("/api/inventory/valuation"),
};

// ===== NOTIFICATIONS =====
export const notificationApi = {
  logs: (page = 1, pageSize = 20) =>
    apiClient.get<ApiResponse<PagedResult<NotificationLogDto>>>("/api/notifications/logs", { params: { page, pageSize } }),
  sendInvoice: (invoiceId: string) => apiClient.post(`/api/notifications/invoices/${invoiceId}/send`),
  sendPaymentReceipt: (paymentId: string) => apiClient.post(`/api/notifications/payments/${paymentId}/send-receipt`),
  sendOverdueReminders: () => apiClient.post("/api/notifications/send-overdue-reminders"),
  sendLowStockAlert: () => apiClient.post("/api/notifications/send-low-stock-alert"),
};

// ===== DOCUMENTS =====
export const documentApi = {
  downloadInvoicePdf: (invoiceId: string) =>
    apiClient.get(`/api/documents/invoices/${invoiceId}/pdf`, { responseType: "blob" }),
  downloadPurchaseOrderPdf: (poId: string) =>
    apiClient.get(`/api/documents/purchase-orders/${poId}/pdf`, { responseType: "blob" }),
  downloadPaymentPdf: (paymentId: string) =>
    apiClient.get(`/api/documents/payments/${paymentId}/pdf`, { responseType: "blob" }),
  exportInvoices: (params?: InvoiceFilterParams) =>
    apiClient.get("/api/documents/invoices/export", { params, responseType: "blob" }),
  exportExpenses: (params?: ExpenseFilterParams) =>
    apiClient.get("/api/documents/expenses/export", { params, responseType: "blob" }),
  exportCustomers: () => apiClient.get("/api/documents/customers/export", { responseType: "blob" }),
  exportProducts: () => apiClient.get("/api/documents/products/export", { responseType: "blob" }),
  exportGSTR1: (month: number, year: number) =>
    apiClient.get("/api/documents/gstr1/export", { params: { month, year }, responseType: "blob" }),
};
