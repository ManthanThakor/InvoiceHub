using Core.Enums;

namespace Application.DTOs;

public record ProductListDto(
    Guid Id,
    string Name,
    string? SKU,
    string? HSNCode,
    ProductType ProductType,
    decimal SalePrice,
    decimal GSTRate,
    decimal CurrentStock,
    decimal MinimumStock,
    bool IsLowStock,
    bool IsActive
);

public record ProductDto(
    Guid Id,
    string Name,
    string? Description,
    string? SKU,
    string? HSNCode,
    string? Barcode,
    ProductType ProductType,
    UnitOfMeasure Unit,
    decimal PurchasePrice,
    decimal SalePrice,
    decimal MRP,
    decimal GSTRate,
    decimal? CessRate,
    bool TrackInventory,
    decimal CurrentStock,
    decimal MinimumStock,
    decimal ReorderQty,
    string? StorageLocation,
    string? ImageUrl,
    bool IsActive,
    Guid? CategoryId,
    string? CategoryName,
    DateTime CreatedAt
);

public record CreateProductDto(
    string Name,
    string? Description,
    string? SKU,
    string? HSNCode,
    string? Barcode,
    ProductType ProductType,
    UnitOfMeasure Unit,
    decimal PurchasePrice,
    decimal SalePrice,
    decimal MRP,
    decimal GSTRate,
    decimal? CessRate,
    bool TrackInventory,
    decimal OpeningStock,
    decimal MinimumStock,
    decimal ReorderQty,
    string? StorageLocation,
    Guid? CategoryId
);

public record UpdateProductDto(
    string Name,
    string? Description,
    string? SKU,
    string? HSNCode,
    string? Barcode,
    ProductType ProductType,
    UnitOfMeasure Unit,
    decimal PurchasePrice,
    decimal SalePrice,
    decimal MRP,
    decimal GSTRate,
    decimal? CessRate,
    bool TrackInventory,
    decimal MinimumStock,
    decimal ReorderQty,
    string? StorageLocation,
    Guid? CategoryId,
    bool IsActive
);

public record ProductFilterDto(
    string? Search,
    ProductType? Type,
    Guid? CategoryId,
    bool? IsActive,
    bool? LowStockOnly,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "Name",
    bool SortDesc = false
);

public record StockAdjustmentDto(
    decimal Quantity,
    InventoryMovementType MovementType,
    string? Notes
);
