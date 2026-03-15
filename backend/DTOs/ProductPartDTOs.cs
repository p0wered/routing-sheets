namespace RoutingSheetsNew.DTOs;

public record ProductPartDto(
    int Id,
    int ProductItemId,
    int PartId,
    int Quantity,
    string? ProductItemName,
    string? PartName,
    List<PartOperationDto>? PartOperations);
