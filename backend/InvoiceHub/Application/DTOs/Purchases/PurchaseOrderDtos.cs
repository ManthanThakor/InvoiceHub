using Core.Enums;

namespace Application.DTOs;

public record PurchaseOrderListDto(
    Guid Id,
    string PONumber,
    DateTime PODate,
    string SupplierName,
    decimal GrandTotal,
    decimal PaidAmount,
    decimal BalanceDue,
    PurchaseOrderStatus Status,
    DateTime? ExpectedDeliveryDate
);

public record PurchaseOrderDto(
    Guid Id,
    string PONumber,
    DateTime PODate,
    DateTime? ExpectedDeliveryDate,
    DateTime? ReceivedDate,
    PurchaseOrderStatus Status,
    Guid SupplierId,
    string SupplierName,
    string? SupplierGSTIN,
    string? SupplierInvoiceNumber,
    DateTime? SupplierInvoiceDate,
    IEnumerable<PurchaseOrderItemDto> Items,
    decimal SubTotal,
    decimal DiscountAmount,
    decimal TaxableAmount,
    decimal IGSTAmount,
    decimal CGSTAmount,
    decimal SGSTAmount,
    decimal CessAmount,
    decimal TotalTaxAmount,
    decimal RoundOff,
    decimal GrandTotal,
    decimal PaidAmount,
    decimal BalanceDue,
    bool IsInterState,
    string? Notes,
    IEnumerable<PaymentDto> Payments,
    DateTime CreatedAt
);

public record PurchaseOrderItemDto(
    Guid? Id,
    int SortOrder,
    Guid ProductId,
    string ProductName,
    string? HSNCode,
    string? Description,
    decimal OrderedQty,
    decimal ReceivedQty,
    UnitOfMeasure Unit,
    decimal UnitPrice,
    decimal DiscountPercent,
    decimal DiscountAmount,
    decimal TaxableAmount,
    decimal GSTRate,
    decimal IGSTAmount,
    decimal CGSTAmount,
    decimal SGSTAmount,
    decimal CessAmount,
    decimal TotalAmount
);

public record CreatePurchaseOrderDto(
    DateTime PODate,
    DateTime? ExpectedDeliveryDate,
    Guid SupplierId,
    bool IsInterState,
    string? SupplierInvoiceNumber,
    DateTime? SupplierInvoiceDate,
    IEnumerable<CreatePurchaseOrderItemDto> Items,
    string? Notes,
    bool SaveAsDraft = false
);

public record CreatePurchaseOrderItemDto(
    Guid ProductId,
    string? Description,
    decimal OrderedQty,
    decimal UnitPrice,
    decimal DiscountPercent
);

public record UpdatePurchaseOrderDto(
    DateTime PODate,
    DateTime? ExpectedDeliveryDate,
    bool IsInterState,
    string? SupplierInvoiceNumber,
    DateTime? SupplierInvoiceDate,
    IEnumerable<CreatePurchaseOrderItemDto> Items,
    string? Notes
);

public record PurchaseOrderFilterDto(
    string? Search,
    PurchaseOrderStatus? Status,
    Guid? SupplierId,
    DateTime? FromDate,
    DateTime? ToDate,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "PODate",
    bool SortDesc = true
);
