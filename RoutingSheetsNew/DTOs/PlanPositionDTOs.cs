namespace RoutingSheetsNew.DTOs;

public record PlanPositionDto(
    int Id, 
    string PositionCode, 
    string Name, 
    int ProductItemId, 
    int QuantityPlanned,
    ProductItemDto? ProductItem);

public record PlanPositionListDto(
    int Id, 
    string PositionCode, 
    string Name, 
    int ProductItemId, 
    int QuantityPlanned);

public record CreatePlanPositionDto(
    string PositionCode, 
    string Name, 
    int ProductItemId, 
    int QuantityPlanned);

public record UpdatePlanPositionDto(
    string PositionCode, 
    string Name, 
    int ProductItemId, 
    int QuantityPlanned);

