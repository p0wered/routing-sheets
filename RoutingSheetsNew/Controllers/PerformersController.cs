using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoutingSheetsNew.Data;
using RoutingSheetsNew.DTOs;
using RoutingSheetsNew.Models;

namespace RoutingSheetsNew.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PerformersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PerformersController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Получить список всех исполнителей
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PerformerDto>>> GetAll()
    {
        var performers = await _context.Performers
            .Select(p => new PerformerDto(p.Id, p.FullName, p.Role))
            .ToListAsync();

        return Ok(performers);
    }

    /// <summary>
    /// Получить исполнителя по ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<PerformerDto>> GetById(int id)
    {
        var performer = await _context.Performers
            .Where(p => p.Id == id)
            .Select(p => new PerformerDto(p.Id, p.FullName, p.Role))
            .FirstOrDefaultAsync();

        if (performer == null)
            return NotFound();

        return Ok(performer);
    }

    /// <summary>
    /// Создать нового исполнителя
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<PerformerDto>> Create([FromBody] CreatePerformerDto dto)
    {
        var performer = new Performer 
        { 
            FullName = dto.FullName,
            Role = dto.Role
        };
        
        _context.Performers.Add(performer);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = performer.Id }, 
            new PerformerDto(performer.Id, performer.FullName, performer.Role));
    }

    /// <summary>
    /// Обновить исполнителя
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePerformerDto dto)
    {
        var performer = await _context.Performers.FindAsync(id);
        if (performer == null)
            return NotFound();

        performer.FullName = dto.FullName;
        performer.Role = dto.Role;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Удалить исполнителя
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var performer = await _context.Performers.FindAsync(id);
        if (performer == null)
            return NotFound();

        // Check if performer is used
        var isUsed = await _context.Operations.AnyAsync(o => o.PerformerId == id);
        if (isUsed)
            return BadRequest("Исполнитель назначен на операции и не может быть удален");

        _context.Performers.Remove(performer);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

