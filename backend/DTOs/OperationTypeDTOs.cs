namespace RoutingSheetsNew.DTOs;

public record OperationTypeDto(int Id, string Name);

public record CreateOperationTypeDto(string Name);

public record UpdateOperationTypeDto(string Name);

