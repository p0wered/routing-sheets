using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoutingSheetsNew.Models;

/// <summary>
/// Цех
/// </summary>
[Table("Guilds")]
public class Guild
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    // Navigation properties
    public virtual ICollection<Operation> Operations { get; set; } = new List<Operation>();
    public virtual ICollection<User> Users { get; set; } = new List<User>();
    public virtual ICollection<PlanPosition> PlanPositions { get; set; } = new List<PlanPosition>();
    public virtual ICollection<PartOperation> PartOperations { get; set; } = new List<PartOperation>();
}

