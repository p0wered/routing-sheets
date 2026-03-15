using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoutingSheetsNew.Data;
using RoutingSheetsNew.DTOs;
using RoutingSheetsNew.Models;

namespace RoutingSheetsNew.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PlanPositionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PlanPositionsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PlanPositionListDto>>> GetAll(
        [FromQuery] int? guildId = null,
        [FromQuery] int? month = null,
        [FromQuery] int? year = null)
    {
        var query = _context.PlanPositions
            .Include(p => p.Guild)
            .Include(p => p.Status)
            .Include(p => p.ProductItem)
            .AsQueryable();

        // Auto-filter by guild for WorkshopChief/WorkshopForeman
        var userGuildId = GetCurrentUserGuildId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userRole is UserRoles.WorkshopChief or UserRoles.WorkshopForeman && userGuildId.HasValue)
        {
            query = query.Where(p => p.GuildId == userGuildId.Value);
        }
        else if (guildId.HasValue)
        {
            query = query.Where(p => p.GuildId == guildId.Value);
        }

        if (month.HasValue)
            query = query.Where(p => p.PlanMonth == month.Value);

        if (year.HasValue)
            query = query.Where(p => p.PlanYear == year.Value);

        var positions = await query
            .OrderByDescending(p => p.PlanYear)
            .ThenByDescending(p => p.PlanMonth)
            .ThenByDescending(p => p.Id)
            .Select(p => new PlanPositionListDto(
                p.Id,
                p.DocumentNumber,
                p.DocumentDate,
                p.PlanMonth,
                p.PlanYear,
                p.PositionCode,
                p.Name,
                p.ProductItemId,
                p.QuantityPlanned,
                p.GuildId,
                p.StatusId,
                p.Guild != null ? p.Guild.Name : null,
                p.Status != null ? p.Status.Name : null,
                p.ProductItem != null ? p.ProductItem.Name : null))
            .ToListAsync();

        return Ok(positions);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PlanPositionDto>> GetById(int id)
    {
        var position = await _context.PlanPositions
            .Include(p => p.ProductItem)
            .Include(p => p.Guild)
            .Include(p => p.Status)
            .Where(p => p.Id == id)
            .Select(p => new PlanPositionDto(
                p.Id,
                p.DocumentNumber,
                p.DocumentDate,
                p.PlanMonth,
                p.PlanYear,
                p.PositionCode,
                p.Name,
                p.ProductItemId,
                p.QuantityPlanned,
                p.GuildId,
                p.StatusId,
                p.Guild != null ? p.Guild.Name : null,
                p.Status != null ? p.Status.Name : null,
                p.ProductItem != null
                    ? new ProductItemDto(p.ProductItem.Id, p.ProductItem.Name, p.ProductItem.Description)
                    : null))
            .FirstOrDefaultAsync();

        if (position == null)
            return NotFound();

        return Ok(position);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = $"{UserRoles.WorkshopChief},{UserRoles.PlanningDept}")]
    public async Task<IActionResult> ChangeStatus(int id, [FromBody] ChangeStatusDto dto)
    {
        var position = await _context.PlanPositions.FindAsync(id);
        if (position == null)
            return NotFound();

        var statusExists = await _context.PlanStatuses.AnyAsync(s => s.Id == dto.StatusId);
        if (!statusExists)
            return BadRequest("Указанный статус не найден");

        // Check guild access for WorkshopChief
        var userGuildId = GetCurrentUserGuildId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole == UserRoles.WorkshopChief && userGuildId.HasValue && position.GuildId != userGuildId.Value)
            return Forbid();

        position.StatusId = dto.StatusId;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private int? GetCurrentUserGuildId()
    {
        var guildIdClaim = User.FindFirst("GuildId")?.Value;
        if (guildIdClaim != null && int.TryParse(guildIdClaim, out var guildId))
            return guildId;
        return null;
    }
}
