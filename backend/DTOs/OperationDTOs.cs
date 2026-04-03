namespace RoutingSheetsNew.DTOs;

public record OperationDto(
    int Id,
    int RoutingSheetId,
    int SeqNumber,
    string? Code,
    string Name,
    int? StatusId,
    int? PerformerId,
    decimal? Price,
    int Quantity,
    OperationStatusDto? Status,
    GuildDto? Guild,
    PerformerDto? Performer);

public record OperationListDto(
    int Id,
    int RoutingSheetId,
    int SeqNumber,
    string? Code,
    string Name,
    int? StatusId,
    int? PerformerId,
    decimal? Price,
    int Quantity,
    string? StatusName,
    string? GuildName,
    string? PerformerName,
    string? RoutingSheetNumber);


public record AssignPerformerDto(int PerformerId);

public record SplitOperationDto(int SplitQuantity);
