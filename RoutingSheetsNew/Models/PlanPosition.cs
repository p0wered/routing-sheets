using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoutingSheetsNew.Models;

/// <summary>
/// Позиция плана производства
/// </summary>
[Table("PlanPositions")]
public class PlanPosition
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    [Column("position_code")]
    public string PositionCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(300)]
    public string Name { get; set; } = string.Empty;

    [Column("product_item_id")]
    public int ProductItemId { get; set; }

    [Column("quantity_planned")]
    public int QuantityPlanned { get; set; }

    // Navigation properties
    [ForeignKey(nameof(ProductItemId))]
    public virtual ProductItem? ProductItem { get; set; }

    public virtual ICollection<RoutingSheet> RoutingSheets { get; set; } = new List<RoutingSheet>();
}

