using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoutingSheetsNew.Models;

/// <summary>
/// Исполнитель
/// </summary>
[Table("Performers")]
public class Performer
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(300)]
    [Column("full_name")]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Role { get; set; }

    // Navigation properties
    public virtual ICollection<Operation> Operations { get; set; } = new List<Operation>();
}

