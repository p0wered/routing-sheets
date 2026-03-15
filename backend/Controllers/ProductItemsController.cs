using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoutingSheetsNew.Data;
using RoutingSheetsNew.DTOs;

namespace RoutingSheetsNew.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductItemsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProductItemsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductItemDto>>> GetAll()
    {
        var items = await _context.ProductItems
            .Select(p => new ProductItemDto(p.Id, p.Name, p.Description))
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductItemDto>> GetById(int id)
    {
        var item = await _context.ProductItems
            .Where(p => p.Id == id)
            .Select(p => new ProductItemDto(p.Id, p.Name, p.Description))
            .FirstOrDefaultAsync();

        if (item == null)
            return NotFound();

        return Ok(item);
    }
}
