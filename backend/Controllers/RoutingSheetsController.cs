using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoutingSheetsNew.Data;
using RoutingSheetsNew.DTOs;
using RoutingSheetsNew.Models;

namespace RoutingSheetsNew.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoutingSheetsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RoutingSheetsController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Получить список маршрутных листов с фильтрацией
    /// </summary>
    /// <param name="planPositionId">Фильтр по позиции плана</param>
    /// <param name="productItemId">Фильтр по изделию (проекту)</param>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoutingSheetListDto>>> GetAll(
        [FromQuery] int? planPositionId = null,
        [FromQuery] int? productItemId = null)
    {
        var query = _context.RoutingSheets
            .Include(rs => rs.Status)
            .Include(rs => rs.PlanPosition)
            .Include(rs => rs.ProductItem)
            .Include(rs => rs.Unit)
            .AsQueryable();

        if (planPositionId.HasValue)
            query = query.Where(rs => rs.PlanPositionId == planPositionId.Value);

        if (productItemId.HasValue)
            query = query.Where(rs => rs.ProductItemId == productItemId.Value);

        var sheets = await query
            .Select(rs => new RoutingSheetListDto(
                rs.Id,
                rs.Number,
                rs.Name,
                rs.PlanPositionId,
                rs.ProductItemId,
                rs.StatusId,
                rs.Quantity,
                rs.CreatedAt,
                rs.Status != null ? rs.Status.Name : null,
                rs.PlanPosition != null ? rs.PlanPosition.Name : null,
                rs.ProductItem != null ? rs.ProductItem.Name : null,
                rs.Unit != null ? rs.Unit.Name : null))
            .ToListAsync();

        return Ok(sheets);
    }

    /// <summary>
    /// Получить маршрутный лист по ID с операциями
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<RoutingSheetDto>> GetById(int id)
    {
        var sheet = await _context.RoutingSheets
            .Include(rs => rs.Status)
            .Include(rs => rs.PlanPosition)
            .Include(rs => rs.ProductItem)
            .Include(rs => rs.Unit)
            .Include(rs => rs.Operations)
                .ThenInclude(o => o.Status)
            .Include(rs => rs.Operations)
                .ThenInclude(o => o.Guild)
            .Include(rs => rs.Operations)
                .ThenInclude(o => o.OperationType)
            .Include(rs => rs.Operations)
                .ThenInclude(o => o.Performer)
            .Where(rs => rs.Id == id)
            .FirstOrDefaultAsync();

        if (sheet == null)
            return NotFound();

        var dto = new RoutingSheetDto(
            sheet.Id,
            sheet.Number,
            sheet.Name,
            sheet.PlanPositionId,
            sheet.ProductItemId,
            sheet.UnitId,
            sheet.StatusId,
            sheet.Quantity,
            sheet.CreatedAt,
            sheet.UpdatedAt,
            sheet.PlanPosition != null
                ? new PlanPositionListDto(
                    sheet.PlanPosition.Id,
                    sheet.PlanPosition.DocumentNumber,
                    sheet.PlanPosition.DocumentDate,
                    sheet.PlanPosition.PlanningPeriod,
                    sheet.PlanPosition.PositionCode,
                    sheet.PlanPosition.Name,
                    sheet.PlanPosition.ProductItemId,
                    sheet.PlanPosition.QuantityPlanned)
                : null,
            sheet.ProductItem != null
                ? new ProductItemDto(sheet.ProductItem.Id, sheet.ProductItem.Name, sheet.ProductItem.Description, sheet.ProductItem.QuantityPlanned)
                : null,
            sheet.Unit != null
                ? new UnitDto(sheet.Unit.Id, sheet.Unit.Name)
                : null,
            sheet.Status != null
                ? new RoutingSheetStatusDto(sheet.Status.Id, sheet.Status.Code, sheet.Status.Name)
                : null,
            sheet.Operations.OrderBy(o => o.SeqNumber).Select(o => new OperationDto(
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
                o.Performer != null ? new PerformerDto(o.Performer.Id, o.Performer.FullName, o.Performer.Role) : null
            )).ToList());

        return Ok(dto);
    }

    /// <summary>
    /// Создать новый маршрутный лист (вручную)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<RoutingSheetListDto>> Create([FromBody] CreateRoutingSheetDto dto)
    {
        // Check if number is unique
        var numberExists = await _context.RoutingSheets.AnyAsync(rs => rs.Number == dto.Number);
        if (numberExists)
            return BadRequest("Маршрутный лист с таким номером уже существует");

        // Validate references
        if (dto.PlanPositionId.HasValue)
        {
            var planPositionExists = await _context.PlanPositions.AnyAsync(p => p.Id == dto.PlanPositionId.Value);
            if (!planPositionExists)
                return BadRequest("Указанная позиция плана не найдена");
        }

        if (dto.ProductItemId.HasValue)
        {
            var productItemExists = await _context.ProductItems.AnyAsync(p => p.Id == dto.ProductItemId.Value);
            if (!productItemExists)
                return BadRequest("Указанное изделие не найдено");
        }

        if (dto.UnitId.HasValue)
        {
            var unitExists = await _context.Units.AnyAsync(u => u.Id == dto.UnitId.Value);
            if (!unitExists)
                return BadRequest("Указанная единица измерения не найдена");
        }

        // Default status is DRAFT (id = 1)
        var sheet = new RoutingSheet
        {
            Number = dto.Number,
            Name = dto.Name,
            PlanPositionId = dto.PlanPositionId,
            ProductItemId = dto.ProductItemId,
            UnitId = dto.UnitId,
            StatusId = 1, // DRAFT
            Quantity = dto.Quantity,
            CreatedAt = DateTime.UtcNow
        };

        _context.RoutingSheets.Add(sheet);
        await _context.SaveChangesAsync();

        var unitName = dto.UnitId.HasValue
            ? (await _context.Units.FindAsync(dto.UnitId.Value))?.Name
            : null;

        return CreatedAtAction(nameof(GetById), new { id = sheet.Id },
            new RoutingSheetListDto(sheet.Id, sheet.Number, sheet.Name, sheet.PlanPositionId, sheet.ProductItemId, sheet.StatusId, sheet.Quantity, sheet.CreatedAt, "Черновик", null, null, unitName));
    }

    /// <summary>
    /// Обновить маршрутный лист
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateRoutingSheetDto dto)
    {
        var sheet = await _context.RoutingSheets.FindAsync(id);
        if (sheet == null)
            return NotFound();

        // Check if number is unique (excluding current)
        var numberExists = await _context.RoutingSheets.AnyAsync(rs => rs.Number == dto.Number && rs.Id != id);
        if (numberExists)
            return BadRequest("Маршрутный лист с таким номером уже существует");

        // Validate references
        if (dto.PlanPositionId.HasValue)
        {
            var planPositionExists = await _context.PlanPositions.AnyAsync(p => p.Id == dto.PlanPositionId.Value);
            if (!planPositionExists)
                return BadRequest("Указанная позиция плана не найдена");
        }

        if (dto.ProductItemId.HasValue)
        {
            var productItemExists = await _context.ProductItems.AnyAsync(p => p.Id == dto.ProductItemId.Value);
            if (!productItemExists)
                return BadRequest("Указанное изделие не найдено");
        }

        if (dto.UnitId.HasValue)
        {
            var unitExists = await _context.Units.AnyAsync(u => u.Id == dto.UnitId.Value);
            if (!unitExists)
                return BadRequest("Указанная единица измерения не найдена");
        }

        sheet.Number = dto.Number;
        sheet.Name = dto.Name;
        sheet.PlanPositionId = dto.PlanPositionId;
        sheet.ProductItemId = dto.ProductItemId;
        sheet.UnitId = dto.UnitId;
        sheet.Quantity = dto.Quantity;
        sheet.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Удалить маршрутный лист
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var sheet = await _context.RoutingSheets
            .Include(rs => rs.Operations)
            .FirstOrDefaultAsync(rs => rs.Id == id);

        if (sheet == null)
            return NotFound();

        // Remove all operations first (cascade should handle this, but being explicit)
        _context.Operations.RemoveRange(sheet.Operations);
        _context.RoutingSheets.Remove(sheet);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Изменить статус маршрутного листа (провести/отменить)
    /// </summary>
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> ChangeStatus(int id, [FromBody] ChangeStatusDto dto)
    {
        var sheet = await _context.RoutingSheets.FindAsync(id);
        if (sheet == null)
            return NotFound();

        // Validate status exists
        var statusExists = await _context.RoutingSheetStatuses.AnyAsync(s => s.Id == dto.StatusId);
        if (!statusExists)
            return BadRequest("Указанный статус не найден");

        sheet.StatusId = dto.StatusId;
        sheet.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Разбить маршрутный лист на несколько (перенести операции в новый МЛ)
    /// </summary>
    [HttpPost("{id}/split")]
    public async Task<ActionResult<RoutingSheetListDto>> Split(int id, [FromBody] SplitRoutingSheetDto dto)
    {
        var sourceSheet = await _context.RoutingSheets
            .Include(rs => rs.Operations)
            .FirstOrDefaultAsync(rs => rs.Id == id);

        if (sourceSheet == null)
            return NotFound("Исходный маршрутный лист не найден");

        // Check if new number is unique
        var numberExists = await _context.RoutingSheets.AnyAsync(rs => rs.Number == dto.NewNumber);
        if (numberExists)
            return BadRequest("Маршрутный лист с таким номером уже существует");

        // Validate operations exist in source sheet
        var operationsToMove = sourceSheet.Operations
            .Where(o => dto.OperationIds.Contains(o.Id))
            .ToList();

        if (operationsToMove.Count != dto.OperationIds.Count)
            return BadRequest("Некоторые из указанных операций не найдены в исходном маршрутном листе");

        // Create new sheet
        var newSheet = new RoutingSheet
        {
            Number = dto.NewNumber,
            Name = dto.NewName,
            PlanPositionId = sourceSheet.PlanPositionId,
            ProductItemId = sourceSheet.ProductItemId,
            UnitId = sourceSheet.UnitId,
            StatusId = 1, // DRAFT
            Quantity = dto.NewQuantity,
            CreatedAt = DateTime.UtcNow
        };

        _context.RoutingSheets.Add(newSheet);
        await _context.SaveChangesAsync();

        // Move operations to new sheet and renumber
        int newSeqNumber = 1;
        foreach (var operation in operationsToMove.OrderBy(o => o.SeqNumber))
        {
            operation.RoutingSheetId = newSheet.Id;
            operation.SeqNumber = newSeqNumber++;
        }

        // Renumber remaining operations in source sheet
        int sourceSeqNumber = 1;
        foreach (var operation in sourceSheet.Operations.Where(o => !dto.OperationIds.Contains(o.Id)).OrderBy(o => o.SeqNumber))
        {
            operation.SeqNumber = sourceSeqNumber++;
        }

        sourceSheet.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = newSheet.Id },
            new RoutingSheetListDto(newSheet.Id, newSheet.Number, newSheet.Name, newSheet.PlanPositionId, newSheet.ProductItemId, newSheet.StatusId, newSheet.Quantity, newSheet.CreatedAt, "Черновик", null, null, null));
    }
}

