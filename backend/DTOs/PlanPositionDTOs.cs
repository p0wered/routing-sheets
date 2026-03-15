namespace RoutingSheetsNew.DTOs;

public record PlanPositionDto(
    int Id,
    string DocumentNumber,
    DateTime DocumentDate,
    int PlanMonth,
    int PlanYear,
    string PositionCode,
    string Name,
    int ProductItemId,
    int QuantityPlanned,
    int GuildId,
    int StatusId,
    string? GuildName,
    string? StatusName,
    ProductItemDto? ProductItem);

public record PlanPositionListDto(
    int Id,
    string DocumentNumber,
    DateTime DocumentDate,
    int PlanMonth,
    int PlanYear,
    string PositionCode,
    string Name,
    int ProductItemId,
    int QuantityPlanned,
    int GuildId,
    int StatusId,
    string? GuildName,
    string? StatusName,
    string? ProductItemName);

