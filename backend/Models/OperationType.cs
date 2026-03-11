using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoutingSheetsNew.Models;

/// <summary>
/// Тип операции
/// </summary>
[Table("OperationTypes")]
public class OperationType
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    // Navigation properties
    public virtual ICollection<Operation> Operations { get; set; } = new List<Operation>();
}

