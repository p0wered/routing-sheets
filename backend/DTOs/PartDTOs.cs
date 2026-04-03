namespace RoutingSheetsNew.DTOs;

public record PartOperationDto(
    int Id,
    int PartId,
    int SeqNumber,
    string Name,
    string? Code,
    decimal? Price);

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
