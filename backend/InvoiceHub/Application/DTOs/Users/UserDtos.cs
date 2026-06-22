using Core.Enums;

namespace Application.DTOs;

public record UserDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    string? ProfilePicture,
    UserRole Role,
    UserStatus Status,
    Guid TenantId,
    DateTime? LastLoginAt
);

public record CreateUserDto(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string? PhoneNumber,
    UserRole Role
);

public record UpdateUserDto(
    string FirstName,
    string LastName,
    string? PhoneNumber,
    UserRole Role,
    UserStatus Status
);
