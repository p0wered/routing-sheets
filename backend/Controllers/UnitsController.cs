using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoutingSheetsNew.Data;
using RoutingSheetsNew.DTOs;
using RoutingSheetsNew.Models;

namespace RoutingSheetsNew.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UnitsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UnitsController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Получить список всех единиц измерения
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UnitDto>>> GetAll()
    {
        var units = await _context.Units
            .Select(u => new UnitDto(u.Id, u.Name))
            .ToListAsync();

        return Ok(units);
    }

    /// <summary>
    /// Получить единицу измерения по ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<UnitDto>> GetById(int id)
    {
        var unit = await _context.Units
            .Where(u => u.Id == id)
            .Select(u => new UnitDto(u.Id, u.Name))
            .FirstOrDefaultAsync();

        if (unit == null)
            return NotFound();

        return Ok(unit);
    }

    /// <summary>
    /// Создать новую единицу измерения
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<UnitDto>> Create([FromBody] CreateUnitDto dto)
    {
        var unit = new Unit { Name = dto.Name };
        
        _context.Units.Add(unit);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = unit.Id }, new UnitDto(unit.Id, unit.Name));
    }

    /// <summary>
    /// Обновить единицу измерения
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUnitDto dto)
    {
        var unit = await _context.Units.FindAsync(id);
        if (unit == null)
            return NotFound();

        unit.Name = dto.Name;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Удалить единицу измерения
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var unit = await _context.Units.FindAsync(id);
        if (unit == null)
            return NotFound();

        // Check if unit is used
        var isUsed = await _context.RoutingSheets.AnyAsync(rs => rs.UnitId == id);
        if (isUsed)
            return BadRequest("Единица измерения используется в маршрутных листах и не может быть удалена");

        _context.Units.Remove(unit);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

