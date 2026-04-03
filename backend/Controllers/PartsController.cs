using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoutingSheetsNew.Data;
using RoutingSheetsNew.DTOs;

namespace RoutingSheetsNew.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PartsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PartsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PartListDto>>> GetAll()
    {
        var parts = await _context.Parts
            .Include(p => p.PartOperations)
            .OrderBy(p => p.Name)
            .Select(p => new PartListDto(
                p.Id,
                p.Name,
                p.Description,
                p.PartOperations.Count))
            .ToListAsync();

        return Ok(parts);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PartDto>> GetById(int id)
    {
        var part = await _context.Parts
            .Include(p => p.PartOperations)
            .Where(p => p.Id == id)
            .Select(p => new PartDto(
                p.Id,
                p.Name,
                p.Description,
                p.PartOperations
                    .OrderBy(po => po.SeqNumber)
                    .Select(po => new PartOperationDto(
                        po.Id,
                        po.PartId,
                        po.SeqNumber,
                        po.Name,
                        po.Code,
                        po.Price))
                    .ToList()))
            .FirstOrDefaultAsync();

        if (part == null)
            return NotFound();

        return Ok(part);
    }
}
