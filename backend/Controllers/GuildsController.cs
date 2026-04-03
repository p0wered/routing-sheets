using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoutingSheetsNew.Data;
using RoutingSheetsNew.DTOs;
using RoutingSheetsNew.Models;

namespace RoutingSheetsNew.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GuildsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public GuildsController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Получить список всех цехов
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GuildDto>>> GetAll()
    {
        var guilds = await _context.Guilds
            .Select(g => new GuildDto(g.Id, g.Name))
            .ToListAsync();

        return Ok(guilds);
    }

    /// <summary>
    /// Получить цех по ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<GuildDto>> GetById(int id)
    {
        var guild = await _context.Guilds
            .Where(g => g.Id == id)
            .Select(g => new GuildDto(g.Id, g.Name))
            .FirstOrDefaultAsync();

        if (guild == null)
            return NotFound();

        return Ok(guild);
    }

    /// <summary>
    /// Создать новый цех
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<GuildDto>> Create([FromBody] CreateGuildDto dto)
    {
        var guild = new Guild { Name = dto.Name };
        
        _context.Guilds.Add(guild);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = guild.Id }, new GuildDto(guild.Id, guild.Name));
    }

    /// <summary>
    /// Обновить цех
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateGuildDto dto)
    {
        var guild = await _context.Guilds.FindAsync(id);
        if (guild == null)
            return NotFound();

        guild.Name = dto.Name;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Удалить цех
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var guild = await _context.Guilds.FindAsync(id);
        if (guild == null)
            return NotFound();

        // Check if guild is used
        var isUsed = await _context.PlanPositions.AnyAsync(p => p.GuildId == id)
            || await _context.Users.AnyAsync(u => u.GuildId == id);
        if (isUsed)
            return BadRequest("Цех используется в планах или пользователях и не может быть удален");

        _context.Guilds.Remove(guild);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
