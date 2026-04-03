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
public class OperationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public OperationsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OperationListDto>>> GetAll(
        [FromQuery] int? routingSheetId = null,
        [FromQuery] int? guildId = null)
    {
        var query = _context.Operations
            .Include(o => o.Status)
            .Include(o => o.Performer)
            .Include(o => o.RoutingSheet).ThenInclude(rs => rs!.PlanPosition).ThenInclude(pp => pp!.Guild)
            .AsQueryable();

        if (routingSheetId.HasValue)
            query = query.Where(o => o.RoutingSheetId == routingSheetId.Value);

        if (guildId.HasValue)
            query = query.Where(o => o.RoutingSheet != null && o.RoutingSheet.PlanPosition != null && o.RoutingSheet.PlanPosition.GuildId == guildId.Value);

        var operations = await query
            .OrderBy(o => o.RoutingSheetId)
            .ThenBy(o => o.SeqNumber)
            .Select(o => new OperationListDto(
                o.Id,
                o.RoutingSheetId,
                o.SeqNumber,
                o.Code,
                o.Name,
                o.StatusId,
                o.PerformerId,
                o.Price,
                o.Quantity,
                o.Status != null ? o.Status.Name : null,
                o.RoutingSheet != null && o.RoutingSheet.PlanPosition != null && o.RoutingSheet.PlanPosition.Guild != null ? o.RoutingSheet.PlanPosition.Guild.Name : null,
                o.Performer != null ? o.Performer.FullName : null,
                o.RoutingSheet != null ? o.RoutingSheet.Number : null))
            .ToListAsync();

        return Ok(operations);
    }

    [HttpGet("by-routing-sheet/{routingSheetId}")]
    public async Task<ActionResult<IEnumerable<OperationListDto>>> GetByRoutingSheet(int routingSheetId)
    {
        var sheetExists = await _context.RoutingSheets.AnyAsync(rs => rs.Id == routingSheetId);
        if (!sheetExists)
            return NotFound("Маршрутный лист не найден");

        var operations = await _context.Operations
            .Include(o => o.Status)
            .Include(o => o.Performer)
            .Include(o => o.RoutingSheet).ThenInclude(rs => rs!.PlanPosition).ThenInclude(pp => pp!.Guild)
            .Where(o => o.RoutingSheetId == routingSheetId)
            .OrderBy(o => o.SeqNumber)
            .Select(o => new OperationListDto(
                o.Id,
                o.RoutingSheetId,
                o.SeqNumber,
                o.Code,
                o.Name,
                o.StatusId,
                o.PerformerId,
                o.Price,
                o.Quantity,
                o.Status != null ? o.Status.Name : null,
                o.RoutingSheet != null && o.RoutingSheet.PlanPosition != null && o.RoutingSheet.PlanPosition.Guild != null ? o.RoutingSheet.PlanPosition.Guild.Name : null,
                o.Performer != null ? o.Performer.FullName : null,
                o.RoutingSheet != null ? o.RoutingSheet.Number : null))
            .ToListAsync();

        return Ok(operations);
    }

    [HttpGet("by-guild/{guildId}")]
    public async Task<ActionResult<IEnumerable<OperationListDto>>> GetByGuild(int guildId)
    {
        var guildExists = await _context.Guilds.AnyAsync(g => g.Id == guildId);
        if (!guildExists)
            return NotFound("Цех не найден");

        var operations = await _context.Operations
            .Include(o => o.Status)
            .Include(o => o.Performer)
            .Include(o => o.RoutingSheet).ThenInclude(rs => rs!.PlanPosition).ThenInclude(pp => pp!.Guild)
            .Where(o => o.RoutingSheet != null && o.RoutingSheet.PlanPosition != null && o.RoutingSheet.PlanPosition.GuildId == guildId)
            .OrderBy(o => o.RoutingSheetId)
            .ThenBy(o => o.SeqNumber)
            .Select(o => new OperationListDto(
                o.Id,
                o.RoutingSheetId,
                o.SeqNumber,
                o.Code,
                o.Name,
                o.StatusId,
                o.PerformerId,
                o.Price,
                o.Quantity,
                o.Status != null ? o.Status.Name : null,
                o.RoutingSheet != null && o.RoutingSheet.PlanPosition != null && o.RoutingSheet.PlanPosition.Guild != null ? o.RoutingSheet.PlanPosition.Guild.Name : null,
                o.Performer != null ? o.Performer.FullName : null,
                o.RoutingSheet != null ? o.RoutingSheet.Number : null))
            .ToListAsync();

        return Ok(operations);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OperationDto>> GetById(int id)
    {
        var operation = await _context.Operations
            .Include(o => o.Status)
            .Include(o => o.Performer)
            .Include(o => o.RoutingSheet).ThenInclude(rs => rs!.PlanPosition).ThenInclude(pp => pp!.Guild)
            .Where(o => o.Id == id)
            .Select(o => new OperationDto(
                o.Id,
                o.RoutingSheetId,
                o.SeqNumber,
                o.Code,
                o.Name,
                o.StatusId,
                o.PerformerId,
                o.Price,
                o.Quantity,
                o.Status != null ? new OperationStatusDto(o.Status.Id, o.Status.Code, o.Status.Name) : null,
                o.RoutingSheet != null && o.RoutingSheet.PlanPosition != null && o.RoutingSheet.PlanPosition.Guild != null
                    ? new GuildDto(o.RoutingSheet.PlanPosition.Guild.Id, o.RoutingSheet.PlanPosition.Guild.Name)
                    : null,
                o.Performer != null ? new PerformerDto(o.Performer.Id, o.Performer.FullName, o.Performer.Role) : null))
            .FirstOrDefaultAsync();

        if (operation == null)
            return NotFound();

        return Ok(operation);
    }

    [HttpPatch("{id}/assign-performer")]
    [Authorize(Roles = $"{UserRoles.WorkshopChief},{UserRoles.WorkshopForeman}")]
    public async Task<IActionResult> AssignPerformer(int id, [FromBody] AssignPerformerDto dto)
    {
        var operation = await _context.Operations.FindAsync(id);
        if (operation == null)
            return NotFound();

        var performerExists = await _context.Performers.AnyAsync(p => p.Id == dto.PerformerId);
        if (!performerExists)
            return BadRequest("Указанный исполнитель не найден");

        operation.PerformerId = dto.PerformerId;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}/performer")]
    public async Task<IActionResult> RemovePerformer(int id)
    {
        var operation = await _context.Operations.FindAsync(id);
        if (operation == null)
            return NotFound();

        operation.PerformerId = null;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = $"{UserRoles.WorkshopChief},{UserRoles.WorkshopForeman}")]
    public async Task<IActionResult> ChangeStatus(int id, [FromBody] ChangeStatusDto dto)
    {
        var operation = await _context.Operations.FindAsync(id);
        if (operation == null)
            return NotFound();

        var statusExists = await _context.OperationStatuses.AnyAsync(s => s.Id == dto.StatusId);
        if (!statusExists)
            return BadRequest("Указанный статус не найден");

        operation.StatusId = dto.StatusId;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/split")]
    public async Task<ActionResult<object>> SplitOperation(int id, [FromBody] SplitOperationDto dto)
    {
        var operation = await _context.Operations.FindAsync(id);
        if (operation == null)
            return NotFound("Операция не найдена");

        if (dto.SplitQuantity <= 0)
            return BadRequest("Количество для отделения должно быть больше 0");

        if (dto.SplitQuantity >= operation.Quantity)
            return BadRequest("Количество для отделения должно быть меньше текущего количества операции");

        var maxSeq = await _context.Operations
            .Where(o => o.RoutingSheetId == operation.RoutingSheetId)
            .MaxAsync(o => o.SeqNumber);

        var newQuantity = dto.SplitQuantity;
        var remainingQuantity = operation.Quantity - newQuantity;

        var newOperation = new Operation
        {
            RoutingSheetId = operation.RoutingSheetId,
            SeqNumber = maxSeq + 1,
            Name = operation.Name,
            Code = operation.Code,
            PerformerId = null,
            Price = operation.Price,
            Quantity = newQuantity,
            StatusId = operation.StatusId
        };

        _context.Operations.Add(newOperation);

        operation.Quantity = remainingQuantity;

        await _context.SaveChangesAsync();

        return Ok(new { OriginalId = operation.Id, NewId = newOperation.Id });
    }
}
