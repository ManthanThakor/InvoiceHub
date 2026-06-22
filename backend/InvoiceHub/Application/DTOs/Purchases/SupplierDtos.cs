using Core.Enums;

namespace Application.DTOs;

public record SupplierListDto(
    Guid Id,
    string Name,
    string? Email,
    string? Phone,
    SupplierStatus Status,
    string? GSTIN,
    string? City
);

public record SupplierDto(
    Guid Id,
    string Name,
    string? ContactPerson,
    string? Email,
    string? Phone,
    string? GSTIN,
    string? PAN,
    SupplierStatus Status,
    AddressDto Address,
    string? BankName,
    string? BankAccountNumber,
    string? BankIFSC,
    int? PaymentTermDays,
    string? Notes,
    DateTime CreatedAt
);

public record CreateSupplierDto(
    string Name,
    string? ContactPerson,
    string? Email,
    string? Phone,
    string? GSTIN,
    string? PAN,
    AddressDto Address,
    string? BankName,
    string? BankAccountNumber,
    string? BankIFSC,
    int? PaymentTermDays,
    string? Notes
);

public record UpdateSupplierDto(
    string Name,
    string? ContactPerson,
    string? Email,
    string? Phone,
    string? GSTIN,
    string? PAN,
    SupplierStatus Status,
    AddressDto Address,
    string? BankName,
    string? BankAccountNumber,
    string? BankIFSC,
    int? PaymentTermDays,
    string? Notes
);

public record SupplierFilterDto(
    string? Search,
    SupplierStatus? Status,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "Name",
    bool SortDesc = false
);
