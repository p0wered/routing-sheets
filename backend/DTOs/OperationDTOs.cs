namespace RoutingSheetsNew.DTOs;

public record OperationDto(
    int Id,
    int RoutingSheetId,
    int SeqNumber,
    string? Code,
    string Name,
    int? StatusId,
    int? GuildId,
    int? OperationTypeId,
    int? PerformerId,
    decimal? Price,
    decimal? Sum,
    int Quantity,
    OperationStatusDto? Status,
    GuildDto? Guild,
    OperationTypeDto? OperationType,
    PerformerDto? Performer);

public record OperationListDto(
    int Id,
    int RoutingSheetId,
    int SeqNumber,
    string? Code,
    string Name,
    int? StatusId,
    int? GuildId,
    int? OperationTypeId,
    int? PerformerId,
    decimal? Price,
    decimal? Sum,
    int Quantity,
    string? StatusName,
    string? GuildName,
    string? OperationTypeName,
    string? PerformerName,
    string? RoutingSheetNumber);


public record AssignPerformerDto(int PerformerId);

public record SplitOperationDto(int SplitQuantity);

