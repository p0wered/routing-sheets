using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoutingSheetsNew.Data;
using RoutingSheetsNew.DTOs;

namespace RoutingSheetsNew.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductPartsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProductPartsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductPartDto>>> GetAll(
        [FromQuery] int? productItemId = null)
    {
        var query = _context.ProductParts
            .Include(pp => pp.ProductItem)
            .Include(pp => pp.Part)
                .ThenInclude(p => p!.PartOperations)
            .AsQueryable();

        if (productItemId.HasValue)
            query = query.Where(pp => pp.ProductItemId == productItemId.Value);

        var productParts = await query
            .OrderBy(pp => pp.ProductItem!.Name)
            .ThenBy(pp => pp.Part!.Name)
            .Select(pp => new ProductPartDto(
                pp.Id,
                pp.ProductItemId,
                pp.PartId,
                pp.Quantity,
                pp.ProductItem != null ? pp.ProductItem.Name : null,
                pp.Part != null ? pp.Part.Name : null,
                pp.Part != null
                    ? pp.Part.PartOperations
                        .OrderBy(po => po.SeqNumber)
                        .Select(po => new PartOperationDto(
                            po.Id,
                            po.PartId,
                            po.SeqNumber,
                            po.Name,
                            po.Code,
                            po.Price))
                        .ToList()
                    : null))
            .ToListAsync();

        return Ok(productParts);
    }
}
