using Core.Enums;

namespace Application.DTOs;

public record NotificationDto(
    Guid Id,
    NotificationType Type,
    NotificationStatus Status,
    string Subject,
    string Body,
    string? Recipient,
    string? ReferenceType,
    Guid? ReferenceId,
    DateTime? SentAt,
    DateTime CreatedAt
);

public record CreateNotificationDto(
    NotificationType Type,
    string Subject,
    string Body,
    string? Recipient,
    string? ReferenceType,
    Guid? ReferenceId,
    Guid? UserId
);
