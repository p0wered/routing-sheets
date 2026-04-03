using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoutingSheetsNew.Models;

/// <summary>
/// Маршрутный лист
/// </summary>
[Table("RoutingSheets")]
public class RoutingSheet
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Number { get; set; } = string.Empty;

    [Required]
    [MaxLength(300)]
    public string Name { get; set; } = string.Empty;

    [Column("plan_position_id")]
    public int? PlanPositionId { get; set; }

    [Column("product_item_id")]
    public int? ProductItemId { get; set; }

    [Column("part_id")]
    public int? PartId { get; set; }

    [Column("unit_id")]
    public int? UnitId { get; set; }

    [Column("status_id")]
    public int StatusId { get; set; }

    public int Quantity { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    [ForeignKey(nameof(PlanPositionId))]
    public virtual PlanPosition? PlanPosition { get; set; }

    [ForeignKey(nameof(ProductItemId))]
    public virtual ProductItem? ProductItem { get; set; }

    [ForeignKey(nameof(PartId))]
    public virtual Part? Part { get; set; }

    [ForeignKey(nameof(UnitId))]
    public virtual Unit? Unit { get; set; }

    [ForeignKey(nameof(StatusId))]
    public virtual RoutingSheetStatus? Status { get; set; }

    public virtual ICollection<Operation> Operations { get; set; } = new List<Operation>();
}
