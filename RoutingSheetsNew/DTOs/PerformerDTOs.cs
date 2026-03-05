namespace RoutingSheetsNew.DTOs;

public record PerformerDto(int Id, string FullName, string? Role);

public record CreatePerformerDto(string FullName, string? Role);

public record UpdatePerformerDto(string FullName, string? Role);

