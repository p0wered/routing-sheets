using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoutingSheetsNew.Models;

/// <summary>
/// Единица измерения
/// </summary>
[Table("Units")]
public class Unit
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    // Navigation properties
    public virtual ICollection<RoutingSheet> RoutingSheets { get; set; } = new List<RoutingSheet>();
}

