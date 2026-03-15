using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoutingSheetsNew.Models;

[Table("PartOperations")]
public class PartOperation
{
    [Key]
    public int Id { get; set; }

    [Column("part_id")]
    public int PartId { get; set; }

    [Column("seq_number")]
    public int SeqNumber { get; set; }

    [Required]
    [MaxLength(300)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Code { get; set; }

    [Column("operation_type_id")]
    public int? OperationTypeId { get; set; }

    [Column("guild_id")]
    public int? GuildId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? Price { get; set; }

    // Navigation properties
    [ForeignKey(nameof(PartId))]
    public virtual Part? Part { get; set; }

    [ForeignKey(nameof(OperationTypeId))]
    public virtual OperationType? OperationType { get; set; }

    [ForeignKey(nameof(GuildId))]
    public virtual Guild? Guild { get; set; }
}
