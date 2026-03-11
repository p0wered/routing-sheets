using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoutingSheetsNew.Models;

/// <summary>
/// Статус маршрутного листа
/// </summary>
[Table("RoutingSheetStatuses")]
public class RoutingSheetStatus
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    // Navigation properties
    public virtual ICollection<RoutingSheet> RoutingSheets { get; set; } = new List<RoutingSheet>();
}

