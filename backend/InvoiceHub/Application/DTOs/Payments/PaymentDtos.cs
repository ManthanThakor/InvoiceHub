using Core.Enums;

namespace Application.DTOs;

public record PaymentDto(
    Guid Id,
    string PaymentNumber,
    DateTime PaymentDate,
    decimal Amount,
    PaymentMethod Method,
    PaymentStatus Status,
    Guid? InvoiceId,
    string? InvoiceNumber,
    Guid? CustomerId,
    string? CustomerName,
    string? ReferenceNumber,
    string? BankName,
    string? Notes,
    bool IsRefund,
    DateTime CreatedAt
);

public record PaymentListDto(
    Guid Id,
    string PaymentNumber,
    DateTime PaymentDate,
    decimal Amount,
    PaymentMethod Method,
    PaymentStatus Status,
    string? CustomerName,
    string? InvoiceNumber,
    bool IsRefund
);

public record RecordPaymentDto(
    Guid? InvoiceId,
    Guid? PurchaseOrderId,
    decimal Amount,
    DateTime PaymentDate,
    PaymentMethod Method,
    string? ReferenceNumber,
    string? BankName,
    string? Notes
);

public record PaymentFilterDto(
    Guid? InvoiceId,
    Guid? CustomerId,
    DateTime? FromDate,
    DateTime? ToDate,
    PaymentMethod? Method,
    PaymentStatus? Status,
    int Page = 1,
    int PageSize = 20
);
