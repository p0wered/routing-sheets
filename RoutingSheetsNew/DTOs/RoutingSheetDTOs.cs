namespace RoutingSheetsNew.DTOs;

public record RoutingSheetDto(
    int Id,
    string Number,
    string Name,
    int? PlanPositionId,
    int? ProductItemId,
    int? UnitId,
    int StatusId,
    int Quantity,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    PlanPositionListDto? PlanPosition,
    ProductItemDto? ProductItem,
    UnitDto? Unit,
    RoutingSheetStatusDto? Status,
    List<OperationDto>? Operations);

public record RoutingSheetListDto(
    int Id,
    string Number,
    string Name,
    int? PlanPositionId,
    int? ProductItemId,
    int StatusId,
    int Quantity,
    DateTime CreatedAt,
    string? StatusName,
    string? PlanPositionName,
    string? ProductItemName);

public record CreateRoutingSheetDto(
    string Number,
    string Name,
    int? PlanPositionId,
    int? ProductItemId,
    int? UnitId,
    int Quantity);

public record UpdateRoutingSheetDto(
    string Number,
    string Name,
    int? PlanPositionId,
    int? ProductItemId,
    int? UnitId,
    int Quantity);

public record ChangeStatusDto(int StatusId);

public record SplitRoutingSheetDto(
    List<int> OperationIds,
    string NewNumber,
    string NewName,
    int NewQuantity);

