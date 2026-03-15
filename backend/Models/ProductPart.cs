using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RoutingSheetsNew.Models;

[Table("ProductParts")]
public class ProductPart
{
    [Key]
    public int Id { get; set; }

    [Column("product_item_id")]
    public int ProductItemId { get; set; }

    [Column("part_id")]
    public int PartId { get; set; }

    public int Quantity { get; set; }

    // Navigation properties
    [ForeignKey(nameof(ProductItemId))]
    public virtual ProductItem? ProductItem { get; set; }

    [ForeignKey(nameof(PartId))]
    public virtual Part? Part { get; set; }
}
