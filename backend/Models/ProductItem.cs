using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoutingSheetsNew.Models;

/// <summary>
/// Главный предметный (Изделие)
/// </summary>
[Table("ProductItems")]
public class ProductItem
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(300)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    // Navigation properties
    public virtual ICollection<PlanPosition> PlanPositions { get; set; } = new List<PlanPosition>();
    public virtual ICollection<RoutingSheet> RoutingSheets { get; set; } = new List<RoutingSheet>();
    public virtual ICollection<ProductPart> ProductParts { get; set; } = new List<ProductPart>();
}

