using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoutingSheetsNew.Models;

[Table("Parts")]
public class Part
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(300)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    // Navigation properties
    public virtual ICollection<PartOperation> PartOperations { get; set; } = new List<PartOperation>();
    public virtual ICollection<ProductPart> ProductParts { get; set; } = new List<ProductPart>();
    public virtual ICollection<RoutingSheet> RoutingSheets { get; set; } = new List<RoutingSheet>();
}
