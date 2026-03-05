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

    /// <summary>
    /// Получить список всех изделий
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductItemDto>>> GetAll()
    {
        var items = await _context.ProductItems
            .Select(p => new ProductItemDto(p.Id, p.Name, p.Description, p.QuantityPlanned))
            .ToListAsync();

        return Ok(items);
    }

    /// <summary>
    /// Получить изделие по ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductItemDto>> GetById(int id)
    {
        var item = await _context.ProductItems
            .Where(p => p.Id == id)
            .Select(p => new ProductItemDto(p.Id, p.Name, p.Description, p.QuantityPlanned))
            .FirstOrDefaultAsync();

        if (item == null)
            return NotFound();

        return Ok(item);
    }
}

