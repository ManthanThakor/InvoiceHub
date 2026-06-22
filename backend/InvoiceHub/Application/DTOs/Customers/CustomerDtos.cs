using Core.Enums;

namespace Application.DTOs;

public record CustomerListDto(
    Guid Id,
    string Name,
    string? Email,
    string? Phone,
    CustomerType CustomerType,
    CustomerStatus Status,
    string? GSTIN,
    string? BillingCity,
    string? BillingState,
    decimal OutstandingBalance,
    DateTime CreatedAt
);

public record CustomerDto(
    Guid Id,
    string Name,
    string? ContactPerson,
    string? Email,
    string? Phone,
    string? AlternatePhone,
    CustomerType CustomerType,
    CustomerStatus Status,
    string? GSTIN,
    string? PAN,
    bool IsGSTRegistered,
    AddressDto BillingAddress,
    AddressDto? ShippingAddress,
    bool ShippingSameAsBilling,
    decimal CreditLimit,
    int? PaymentTermDays,
    string? Notes,
    string? Tags,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record CreateCustomerDto(
    string Name,
    string? ContactPerson,
    string? Email,
    string? Phone,
    string? AlternatePhone,
    CustomerType CustomerType,
    string? GSTIN,
    string? PAN,
    AddressDto BillingAddress,
    AddressDto? ShippingAddress,
    bool ShippingSameAsBilling,
    decimal CreditLimit,
    int? PaymentTermDays,
    string? Notes,
    string? Tags
);

public record UpdateCustomerDto(
    string Name,
    string? ContactPerson,
    string? Email,
    string? Phone,
    string? AlternatePhone,
    CustomerType CustomerType,
    CustomerStatus Status,
    string? GSTIN,
    string? PAN,
    AddressDto BillingAddress,
    AddressDto? ShippingAddress,
    bool ShippingSameAsBilling,
    decimal CreditLimit,
    int? PaymentTermDays,
    string? Notes,
    string? Tags
);

public record CustomerFilterDto(
    string? Search,
    CustomerType? Type,
    CustomerStatus? Status,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "Name",
    bool SortDesc = false
);

public record CustomerStatisticsDto(
    Guid CustomerId,
    string Name,
    int TotalInvoices,
    decimal TotalRevenue,
    decimal OutstandingBalance,
    decimal AverageInvoiceValue,
    DateTime? LastInvoiceDate,
    int TotalDaysOverdue
);
