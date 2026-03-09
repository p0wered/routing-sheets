namespace RoutingSheetsNew.DTOs;

public record PlanPositionDto(
    int Id, 
    string DocumentNumber,
    DateTime DocumentDate,
    string? PlanningPeriod,
    string PositionCode, 
    string Name, 
    int ProductItemId, 
    int QuantityPlanned,
    ProductItemDto? ProductItem);

public record PlanPositionListDto(
    int Id, 
    string DocumentNumber,
    DateTime DocumentDate,
    string? PlanningPeriod,
    string PositionCode, 
    string Name, 
    int ProductItemId, 
    int QuantityPlanned);

public record CreatePlanPositionDto(
    string DocumentNumber,
    DateTime DocumentDate,
    string? PlanningPeriod,
    string PositionCode, 
    string Name, 
    int ProductItemId, 
    int QuantityPlanned);

public record UpdatePlanPositionDto(
    string DocumentNumber,
    DateTime DocumentDate,
    string? PlanningPeriod,
    string PositionCode, 
    string Name, 
    int ProductItemId, 
    int QuantityPlanned);

