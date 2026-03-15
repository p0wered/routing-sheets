using System.ComponentModel.DataAnnotations;

namespace RoutingSheetsNew.DTOs;

public class LoginDto
{
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}

public class UserDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int? GuildId { get; set; }
    public string? GuildName { get; set; }
}

public class CreateUserDto
{
    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MinLength(4)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [MaxLength(300)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Role { get; set; } = string.Empty;

    public int? GuildId { get; set; }
}

public class UpdateUserDto
{
    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [MinLength(4)]
    public string? Password { get; set; }

    [Required]
    [MaxLength(300)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Role { get; set; } = string.Empty;

    public int? GuildId { get; set; }
}
