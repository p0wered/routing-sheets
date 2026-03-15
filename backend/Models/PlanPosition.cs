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

    /// <summary>
    /// Номер документа плана производства (вводится вручную)
    /// </summary>
    [Required]
    [MaxLength(100)]
    [Column("document_number")]
    public string DocumentNumber { get; set; } = string.Empty;

    /// <summary>
    /// Дата документа плана производства (без времени, локальная дата)
    /// </summary>
    [Column("document_date", TypeName = "date")]
    public DateTime DocumentDate { get; set; }

    [Column("plan_month")]
    public int PlanMonth { get; set; }

    [Column("plan_year")]
    public int PlanYear { get; set; }

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

    [Column("guild_id")]
    public int GuildId { get; set; }

    [Column("status_id")]
    public int StatusId { get; set; } = 1;

    // Navigation properties
    [ForeignKey(nameof(ProductItemId))]
    public virtual ProductItem? ProductItem { get; set; }

    [ForeignKey(nameof(GuildId))]
    public virtual Guild? Guild { get; set; }

    [ForeignKey(nameof(StatusId))]
    public virtual PlanStatus? Status { get; set; }

    public virtual ICollection<RoutingSheet> RoutingSheets { get; set; } = new List<RoutingSheet>();
}

