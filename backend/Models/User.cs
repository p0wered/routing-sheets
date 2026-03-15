using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoutingSheetsNew.Models;

[Table("Users")]
public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [MaxLength(300)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Role { get; set; } = string.Empty;

    [Column("guild_id")]
    public int? GuildId { get; set; }

    // Navigation properties
    [ForeignKey(nameof(GuildId))]
    public virtual Guild? Guild { get; set; }
}

public static class UserRoles
{
    public const string WorkshopChief = "WorkshopChief";
    public const string WorkshopForeman = "WorkshopForeman";
    public const string PlanningDept = "PlanningDept";
}
