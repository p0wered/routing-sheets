using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoutingSheetsNew.Models;

/// <summary>
/// Операция
/// </summary>
[Table("Operations")]
public class Operation
{
    [Key]
    public int Id { get; set; }

    [Column("routing_sheet_id")]
    public int RoutingSheetId { get; set; }

    [Column("seq_number")]
    public int SeqNumber { get; set; }

    [MaxLength(50)]
    public string? Code { get; set; }

    [Required]
    [MaxLength(300)]
    public string Name { get; set; } = string.Empty;

    [Column("status_id")]
    public int? StatusId { get; set; }

    [Column("guild_id")]
    public int? GuildId { get; set; }

    [Column("operation_type_id")]
    public int? OperationTypeId { get; set; }

    [Column("performer_id")]
    public int? PerformerId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? Price { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? Sum { get; set; }

    public int Quantity { get; set; }

    // Navigation properties
    [ForeignKey(nameof(RoutingSheetId))]
    public virtual RoutingSheet? RoutingSheet { get; set; }

    [ForeignKey(nameof(StatusId))]
    public virtual OperationStatus? Status { get; set; }

    [ForeignKey(nameof(GuildId))]
    public virtual Guild? Guild { get; set; }

    [ForeignKey(nameof(OperationTypeId))]
    public virtual OperationType? OperationType { get; set; }

    [ForeignKey(nameof(PerformerId))]
    public virtual Performer? Performer { get; set; }
}

