namespace RoutingSheetsNew.DTOs;

public record PartOperationDto(
    int Id,
    int PartId,
    int SeqNumber,
    string Name,
    string? Code,
    int? OperationTypeId,
    int? GuildId,
    decimal? Price,
    string? OperationTypeName,
    string? GuildName);

public record PartDto(
    int Id,
    string Name,
    string? Description,
    List<PartOperationDto> Operations);

public record PartRefDto(
    int Id,
    string Name,
    string? Description);

public record PartListDto(
    int Id,
    string Name,
    string? Description,
    int OperationCount);
