using Core.Enums;

namespace Application.DTOs;

public record InvoiceListDto(
    Guid Id,
    string InvoiceNumber,
    DateTime InvoiceDate,
    DateTime? DueDate,
    Guid CustomerId,
    string CustomerName,
    decimal GrandTotal,
    decimal PaidAmount,
    decimal BalanceDue,
    InvoiceStatus Status,
    bool IsOverdue
);

public record InvoiceDto(
    Guid Id,
    string InvoiceNumber,
    DateTime InvoiceDate,
    DateTime? DueDate,
    InvoiceStatus Status,

    // Customer
    Guid CustomerId,
    string CustomerName,
    string? CustomerGSTIN,
    AddressDto? BillingAddress,
    AddressDto? ShippingAddress,

    // GST
    bool IsInterState,
    string? PlaceOfSupply,
    string? PlaceOfSupplyCode,

    // Line Items
    IEnumerable<InvoiceItemDto> Items,

    // Amounts
    decimal SubTotal,
    decimal DiscountAmount,
    DiscountType DiscountType,
    decimal? DiscountPercent,
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

    // Meta
    string? Notes,
    string? TermsAndConditions,
    string? EWayBillNumber,
    string? IRN,
    IEnumerable<PaymentDto> Payments,
    DateTime CreatedAt
);

public record InvoiceItemDto(
    Guid? Id,
    int SortOrder,
    Guid ProductId,
    string ProductName,
    string? HSNCode,
    string? Description,
    decimal Quantity,
    UnitOfMeasure Unit,
    decimal UnitPrice,
    decimal DiscountPercent,
    decimal DiscountAmount,
    decimal TaxableAmount,
    decimal GSTRate,
    decimal IGSTRate, decimal IGSTAmount,
    decimal CGSTRate, decimal CGSTAmount,
    decimal SGSTRate, decimal SGSTAmount,
    decimal CessRate, decimal CessAmount,
    decimal TotalAmount
);

public record CreateInvoiceDto(
    DateTime InvoiceDate,
    DateTime? DueDate,
    Guid CustomerId,
    bool IsInterState,
    string? PlaceOfSupply,
    string? PlaceOfSupplyCode,
    IEnumerable<CreateInvoiceItemDto> Items,
    DiscountType DiscountType,
    decimal? DiscountPercent,
    decimal? DiscountAmount,
    string? Notes,
    string? TermsAndConditions,
    string? ShippingDetails,
    string? VehicleNumber,
    string? EWayBillNumber,
    bool SaveAsDraft = false
);

public record CreateInvoiceItemDto(
    Guid ProductId,
    string? Description,
    decimal Quantity,
    decimal UnitPrice,
    decimal DiscountPercent
);

public record UpdateInvoiceDto(
    DateTime InvoiceDate,
    DateTime? DueDate,
    bool IsInterState,
    string? PlaceOfSupply,
    IEnumerable<CreateInvoiceItemDto> Items,
    DiscountType DiscountType,
    decimal? DiscountPercent,
    decimal? DiscountAmount,
    string? Notes,
    string? TermsAndConditions,
    string? EWayBillNumber
);

public record InvoiceFilterDto(
    string? Search,
    InvoiceStatus? Status,
    Guid? CustomerId,
    DateTime? FromDate,
    DateTime? ToDate,
    bool? OverdueOnly,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "InvoiceDate",
    bool SortDesc = true
);

public record GSTSummaryDto(
    int Month,
    int Year,
    decimal TaxableAmount,
    decimal TotalIGST,
    decimal TotalCGST,
    decimal TotalSGST,
    decimal TotalCess,
    decimal TotalTax,
    IEnumerable<GSTHSNSummaryDto> HSNSummary,
    IEnumerable<GSTStatewiseSummaryDto> StatewiseSummary
);

public record GSTHSNSummaryDto(string HSNCode, decimal TaxableAmount, decimal IGSTAmount, decimal CGSTAmount, decimal SGSTAmount, decimal TotalTax);
public record GSTStatewiseSummaryDto(string State, string StateCode, decimal TaxableAmount, decimal IGSTAmount, int InvoiceCount);
