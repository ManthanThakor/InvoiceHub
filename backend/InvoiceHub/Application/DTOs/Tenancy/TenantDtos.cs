namespace Application.DTOs;

public record TenantDto(
    Guid Id,
    string BusinessName,
    string? BusinessLogo,
    string? LegalName,
    string? GSTIN,
    string? PAN,
    string? TAN,
    string? CIN,
    string? Email,
    string? Phone,
    string? Website,
    AddressDto Address,
    string CurrencyCode,
    string? InvoicePrefix,
    string? PurchasePrefix,
    string? FinancialYearStart,
    bool IsGSTRegistered,
    string? BankName,
    string? BankAccountNumber,
    string? BankIFSC,
    string? BankBranch,
    string? UPIId
);

public record UpdateTenantDto(
    string BusinessName,
    string? LegalName,
    string? GSTIN,
    string? PAN,
    string? TAN,
    string? CIN,
    string? Email,
    string? Phone,
    string? Website,
    AddressDto Address,
    string? InvoicePrefix,
    string? PurchasePrefix,
    string? FinancialYearStart,
    bool IsGSTRegistered,
    string? BankName,
    string? BankAccountNumber,
    string? BankIFSC,
    string? BankBranch,
    string? UPIId
);
