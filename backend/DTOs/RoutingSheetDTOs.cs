namespace RoutingSheetsNew.DTOs;

public record RoutingSheetDto(
    int Id,
    string Number,
    string Name,
    int? PlanPositionId,
    int? ProductItemId,
    int? PartId,
    int? UnitId,
    int StatusId,
    int Quantity,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    PlanPositionListDto? PlanPosition,
    ProductItemDto? ProductItem,
    PartRefDto? Part,
    UnitDto? Unit,
    RoutingSheetStatusDto? Status,
    List<OperationDto>? Operations);

public record RoutingSheetListDto(
    int Id,
    string Number,
    string Name,
    int? PlanPositionId,
    int? ProductItemId,
    int? PartId,
    int StatusId,
    int Quantity,
    DateTime CreatedAt,
    string? StatusName,
    string? PlanPositionName,
    string? ProductItemName,
    string? PartName,
    string? UnitName);


public record ChangeStatusDto(int StatusId);

public record SplitQuantityDto(int SplitQuantity);
