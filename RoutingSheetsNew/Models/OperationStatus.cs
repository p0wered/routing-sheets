using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoutingSheetsNew.Models;

/// <summary>
/// Статус операции
/// </summary>
[Table("OperationStatuses")]
public class OperationStatus
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    // Navigation properties
    public virtual ICollection<Operation> Operations { get; set; } = new List<Operation>();
}

