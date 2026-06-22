namespace Application.DTOs;

public record AuditLogDto(
    Guid Id,
    string EntityType,
    Guid EntityId,
    string Action,
    string? OldValues,
    string? NewValues,
    string? ChangedProperties,
    string? IpAddress,
    Guid UserId,
    string UserName,
    DateTime CreatedAt
);

public record AuditLogFilterDto(
    string? EntityType,
    Guid? EntityId,
    string? Action,
    Guid? UserId,
    DateTime? FromDate,
    DateTime? ToDate,
    int Page = 1,
    int PageSize = 20
);
