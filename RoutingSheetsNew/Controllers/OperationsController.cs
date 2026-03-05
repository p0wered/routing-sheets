using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoutingSheetsNew.Data;
using RoutingSheetsNew.DTOs;
using RoutingSheetsNew.Models;

namespace RoutingSheetsNew.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OperationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public OperationsController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Получить список операций с фильтрацией
    /// </summary>
    /// <param name="routingSheetId">Фильтр по маршрутному листу</param>
    /// <param name="guildId">Фильтр по цеху</param>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<OperationListDto>>> GetAll(
        [FromQuery] int? routingSheetId = null,
        [FromQuery] int? guildId = null)
    {
        var query = _context.Operations
            .Include(o => o.Status)
            .Include(o => o.Guild)
            .Include(o => o.OperationType)
            .Include(o => o.Performer)
            .Include(o => o.RoutingSheet)
            .AsQueryable();

        if (routingSheetId.HasValue)
            query = query.Where(o => o.RoutingSheetId == routingSheetId.Value);

        if (guildId.HasValue)
            query = query.Where(o => o.GuildId == guildId.Value);

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
                o.GuildId,
                o.OperationTypeId,
                o.PerformerId,
                o.Price,
                o.Sum,
                o.Quantity,
                o.Status != null ? o.Status.Name : null,
                o.Guild != null ? o.Guild.Name : null,
                o.OperationType != null ? o.OperationType.Name : null,
                o.Performer != null ? o.Performer.FullName : null,
                o.RoutingSheet != null ? o.RoutingSheet.Number : null))
            .ToListAsync();

        return Ok(operations);
    }

    /// <summary>
    /// Получить операции по маршрутному листу
    /// </summary>
    [HttpGet("by-routing-sheet/{routingSheetId}")]
    public async Task<ActionResult<IEnumerable<OperationListDto>>> GetByRoutingSheet(int routingSheetId)
    {
        var sheetExists = await _context.RoutingSheets.AnyAsync(rs => rs.Id == routingSheetId);
        if (!sheetExists)
            return NotFound("Маршрутный лист не найден");

        var operations = await _context.Operations
            .Include(o => o.Status)
            .Include(o => o.Guild)
            .Include(o => o.OperationType)
            .Include(o => o.Performer)
            .Include(o => o.RoutingSheet)
            .Where(o => o.RoutingSheetId == routingSheetId)
            .OrderBy(o => o.SeqNumber)
            .Select(o => new OperationListDto(
                o.Id,
                o.RoutingSheetId,
                o.SeqNumber,
                o.Code,
                o.Name,
                o.StatusId,
                o.GuildId,
                o.OperationTypeId,
                o.PerformerId,
                o.Price,
                o.Sum,
                o.Quantity,
                o.Status != null ? o.Status.Name : null,
                o.Guild != null ? o.Guild.Name : null,
                o.OperationType != null ? o.OperationType.Name : null,
                o.Performer != null ? o.Performer.FullName : null,
                o.RoutingSheet != null ? o.RoutingSheet.Number : null))
            .ToListAsync();

        return Ok(operations);
    }

    /// <summary>
    /// Получить операции по цеху
    /// </summary>
    [HttpGet("by-guild/{guildId}")]
    public async Task<ActionResult<IEnumerable<OperationListDto>>> GetByGuild(int guildId)
    {
        var guildExists = await _context.Guilds.AnyAsync(g => g.Id == guildId);
        if (!guildExists)
            return NotFound("Цех не найден");

        var operations = await _context.Operations
            .Include(o => o.Status)
            .Include(o => o.Guild)
            .Include(o => o.OperationType)
            .Include(o => o.Performer)
            .Include(o => o.RoutingSheet)
            .Where(o => o.GuildId == guildId)
            .OrderBy(o => o.RoutingSheetId)
            .ThenBy(o => o.SeqNumber)
            .Select(o => new OperationListDto(
                o.Id,
                o.RoutingSheetId,
                o.SeqNumber,
                o.Code,
                o.Name,
                o.StatusId,
                o.GuildId,
                o.OperationTypeId,
                o.PerformerId,
                o.Price,
                o.Sum,
                o.Quantity,
                o.Status != null ? o.Status.Name : null,
                o.Guild != null ? o.Guild.Name : null,
                o.OperationType != null ? o.OperationType.Name : null,
                o.Performer != null ? o.Performer.FullName : null,
                o.RoutingSheet != null ? o.RoutingSheet.Number : null))
            .ToListAsync();

        return Ok(operations);
    }

    /// <summary>
    /// Получить операцию по ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<OperationDto>> GetById(int id)
    {
        var operation = await _context.Operations
            .Include(o => o.Status)
            .Include(o => o.Guild)
            .Include(o => o.OperationType)
            .Include(o => o.Performer)
            .Where(o => o.Id == id)
            .Select(o => new OperationDto(
                o.Id,
                o.RoutingSheetId,
                o.SeqNumber,
                o.Code,
                o.Name,
                o.StatusId,
                o.GuildId,
                o.OperationTypeId,
                o.PerformerId,
                o.Price,
                o.Sum,
                o.Quantity,
                o.Status != null ? new OperationStatusDto(o.Status.Id, o.Status.Code, o.Status.Name) : null,
                o.Guild != null ? new GuildDto(o.Guild.Id, o.Guild.Name) : null,
                o.OperationType != null ? new OperationTypeDto(o.OperationType.Id, o.OperationType.Name) : null,
                o.Performer != null ? new PerformerDto(o.Performer.Id, o.Performer.FullName, o.Performer.Role) : null))
            .FirstOrDefaultAsync();

        if (operation == null)
            return NotFound();

        return Ok(operation);
    }

    /// <summary>
    /// Создать новую операцию в маршрутном листе
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<OperationDto>> Create([FromBody] CreateOperationDto dto)
    {
        // Validate routing sheet exists
        var sheetExists = await _context.RoutingSheets.AnyAsync(rs => rs.Id == dto.RoutingSheetId);
        if (!sheetExists)
            return BadRequest("Маршрутный лист не найден");

        // Validate references
        if (dto.StatusId.HasValue)
        {
            var statusExists = await _context.OperationStatuses.AnyAsync(s => s.Id == dto.StatusId.Value);
            if (!statusExists)
                return BadRequest("Указанный статус операции не найден");
        }

        if (dto.GuildId.HasValue)
        {
            var guildExists = await _context.Guilds.AnyAsync(g => g.Id == dto.GuildId.Value);
            if (!guildExists)
                return BadRequest("Указанный цех не найден");
        }

        if (dto.OperationTypeId.HasValue)
        {
            var typeExists = await _context.OperationTypes.AnyAsync(t => t.Id == dto.OperationTypeId.Value);
            if (!typeExists)
                return BadRequest("Указанный тип операции не найден");
        }

        if (dto.PerformerId.HasValue)
        {
            var performerExists = await _context.Performers.AnyAsync(p => p.Id == dto.PerformerId.Value);
            if (!performerExists)
                return BadRequest("Указанный исполнитель не найден");
        }

        var operation = new Operation
        {
            RoutingSheetId = dto.RoutingSheetId,
            SeqNumber = dto.SeqNumber,
            Code = dto.Code,
            Name = dto.Name,
            StatusId = dto.StatusId ?? 1, // Default to PENDING
            GuildId = dto.GuildId,
            OperationTypeId = dto.OperationTypeId,
            PerformerId = dto.PerformerId,
            Price = dto.Price,
            Sum = dto.Sum,
            Quantity = dto.Quantity
        };

        _context.Operations.Add(operation);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = operation.Id },
            new OperationDto(operation.Id, operation.RoutingSheetId, operation.SeqNumber, operation.Code, operation.Name,
                operation.StatusId, operation.GuildId, operation.OperationTypeId, operation.PerformerId,
                operation.Price, operation.Sum, operation.Quantity, null, null, null, null));
    }

    /// <summary>
    /// Обновить операцию
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateOperationDto dto)
    {
        var operation = await _context.Operations.FindAsync(id);
        if (operation == null)
            return NotFound();

        // Validate references
        if (dto.StatusId.HasValue)
        {
            var statusExists = await _context.OperationStatuses.AnyAsync(s => s.Id == dto.StatusId.Value);
            if (!statusExists)
                return BadRequest("Указанный статус операции не найден");
        }

        if (dto.GuildId.HasValue)
        {
            var guildExists = await _context.Guilds.AnyAsync(g => g.Id == dto.GuildId.Value);
            if (!guildExists)
                return BadRequest("Указанный цех не найден");
        }

        if (dto.OperationTypeId.HasValue)
        {
            var typeExists = await _context.OperationTypes.AnyAsync(t => t.Id == dto.OperationTypeId.Value);
            if (!typeExists)
                return BadRequest("Указанный тип операции не найден");
        }

        operation.SeqNumber = dto.SeqNumber;
        operation.Code = dto.Code;
        operation.Name = dto.Name;
        operation.StatusId = dto.StatusId;
        operation.GuildId = dto.GuildId;
        operation.OperationTypeId = dto.OperationTypeId;
        operation.Price = dto.Price;
        operation.Sum = dto.Sum;
        operation.Quantity = dto.Quantity;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Удалить операцию
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var operation = await _context.Operations.FindAsync(id);
        if (operation == null)
            return NotFound();

        var routingSheetId = operation.RoutingSheetId;

        _context.Operations.Remove(operation);
        await _context.SaveChangesAsync();

        // Renumber remaining operations
        var remainingOperations = await _context.Operations
            .Where(o => o.RoutingSheetId == routingSheetId)
            .OrderBy(o => o.SeqNumber)
            .ToListAsync();

        int seqNumber = 1;
        foreach (var op in remainingOperations)
        {
            op.SeqNumber = seqNumber++;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Назначить исполнителя на операцию
    /// </summary>
    [HttpPatch("{id}/assign-performer")]
    public async Task<IActionResult> AssignPerformer(int id, [FromBody] AssignPerformerDto dto)
    {
        var operation = await _context.Operations.FindAsync(id);
        if (operation == null)
            return NotFound();

        // Validate performer exists
        var performerExists = await _context.Performers.AnyAsync(p => p.Id == dto.PerformerId);
        if (!performerExists)
            return BadRequest("Указанный исполнитель не найден");

        operation.PerformerId = dto.PerformerId;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Снять исполнителя с операции
    /// </summary>
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

    /// <summary>
    /// Изменить статус операции
    /// </summary>
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> ChangeStatus(int id, [FromBody] ChangeStatusDto dto)
    {
        var operation = await _context.Operations.FindAsync(id);
        if (operation == null)
            return NotFound();

        // Validate status exists
        var statusExists = await _context.OperationStatuses.AnyAsync(s => s.Id == dto.StatusId);
        if (!statusExists)
            return BadRequest("Указанный статус не найден");

        operation.StatusId = dto.StatusId;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

