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
public class RoutingSheetsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RoutingSheetsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoutingSheetListDto>>> GetAll(
        [FromQuery] int? planPositionId = null,
        [FromQuery] int? productItemId = null,
        [FromQuery] int? guildId = null,
        [FromQuery] DateTime? createdFrom = null,
        [FromQuery] DateTime? createdTo = null)
    {
        var query = _context.RoutingSheets
            .Include(rs => rs.Status)
            .Include(rs => rs.PlanPosition)
            .Include(rs => rs.ProductItem)
            .Include(rs => rs.Unit)
            .AsQueryable();

        // Auto-filter by guild for WorkshopChief/WorkshopForeman
        var userGuildId = GetCurrentUserGuildId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userRole is UserRoles.WorkshopChief or UserRoles.WorkshopForeman && userGuildId.HasValue)
        {
            query = query.Where(rs => rs.PlanPosition != null && rs.PlanPosition.GuildId == userGuildId.Value);
        }
        else if (guildId.HasValue)
        {
            query = query.Where(rs => rs.PlanPosition != null && rs.PlanPosition.GuildId == guildId.Value);
        }

        if (planPositionId.HasValue)
            query = query.Where(rs => rs.PlanPositionId == planPositionId.Value);

        if (productItemId.HasValue)
            query = query.Where(rs => rs.ProductItemId == productItemId.Value);

        if (createdFrom.HasValue)
            query = query.Where(rs => rs.CreatedAt >= createdFrom.Value);

        if (createdTo.HasValue)
            query = query.Where(rs => rs.CreatedAt <= createdTo.Value);

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

    [HttpGet("{id}")]
    public async Task<ActionResult<RoutingSheetDto>> GetById(int id)
    {
        var sheet = await _context.RoutingSheets
            .Include(rs => rs.Status)
            .Include(rs => rs.PlanPosition).ThenInclude(pp => pp!.Guild)
            .Include(rs => rs.PlanPosition).ThenInclude(pp => pp!.Status)
            .Include(rs => rs.PlanPosition).ThenInclude(pp => pp!.ProductItem)
            .Include(rs => rs.ProductItem)
            .Include(rs => rs.Unit)
            .Include(rs => rs.Operations).ThenInclude(o => o.Status)
            .Include(rs => rs.Operations).ThenInclude(o => o.Guild)
            .Include(rs => rs.Operations).ThenInclude(o => o.OperationType)
            .Include(rs => rs.Operations).ThenInclude(o => o.Performer)
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
                    sheet.PlanPosition.PlanMonth,
                    sheet.PlanPosition.PlanYear,
                    sheet.PlanPosition.PositionCode,
                    sheet.PlanPosition.Name,
                    sheet.PlanPosition.ProductItemId,
                    sheet.PlanPosition.QuantityPlanned,
                    sheet.PlanPosition.GuildId,
                    sheet.PlanPosition.StatusId,
                    sheet.PlanPosition.Guild?.Name,
                    sheet.PlanPosition.Status?.Name,
                    sheet.PlanPosition.ProductItem?.Name)
                : null,
            sheet.ProductItem != null
                ? new ProductItemDto(sheet.ProductItem.Id, sheet.ProductItem.Name, sheet.ProductItem.Description)
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

    [HttpPost("generate/{planPositionId}")]
    [Authorize(Roles = $"{UserRoles.WorkshopChief},{UserRoles.PlanningDept}")]
    public async Task<ActionResult<RoutingSheetDto>> Generate(int planPositionId)
    {
        var planPosition = await _context.PlanPositions
            .Include(pp => pp.ProductItem)
            .Include(pp => pp.Guild)
            .Include(pp => pp.Status)
            .FirstOrDefaultAsync(pp => pp.Id == planPositionId);

        if (planPosition == null)
            return NotFound("Позиция плана не найдена");

        if (planPosition.StatusId != 1) // not OPEN
            return BadRequest("План должен быть в статусе «Открыт»");

        var existingSheet = await _context.RoutingSheets
            .AnyAsync(rs => rs.PlanPositionId == planPositionId);
        if (existingSheet)
            return BadRequest("Для этого плана уже сформирован маршрутный лист");

        // Check guild access for WorkshopChief
        var userGuildId = GetCurrentUserGuildId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole == UserRoles.WorkshopChief && userGuildId.HasValue && planPosition.GuildId != userGuildId.Value)
            return Forbid();

        // Get product composition with part operations
        var productParts = await _context.ProductParts
            .Include(pp => pp.Part)
                .ThenInclude(p => p!.PartOperations)
            .Where(pp => pp.ProductItemId == planPosition.ProductItemId)
            .OrderBy(pp => pp.PartId)
            .ToListAsync();

        // Build operations from part operations
        var operations = new List<Operation>();
        int seqNumber = 1;

        foreach (var productPart in productParts)
        {
            if (productPart.Part?.PartOperations == null) continue;

            foreach (var partOp in productPart.Part.PartOperations.OrderBy(po => po.SeqNumber))
            {
                var quantity = productPart.Quantity * planPosition.QuantityPlanned;
                operations.Add(new Operation
                {
                    SeqNumber = seqNumber++,
                    Name = partOp.Name,
                    Code = partOp.Code,
                    OperationTypeId = partOp.OperationTypeId,
                    GuildId = partOp.GuildId,
                    Price = partOp.Price,
                    Quantity = quantity,
                    Sum = partOp.Price.HasValue ? partOp.Price.Value * quantity : null,
                    StatusId = 1 // PENDING
                });
            }
        }

        // Generate unique number
        var number = await GenerateRoutingSheetNumber();

        var sheet = new RoutingSheet
        {
            Number = number,
            Name = $"МЛ для {planPosition.ProductItem?.Name ?? "изделия"}",
            PlanPositionId = planPositionId,
            ProductItemId = planPosition.ProductItemId,
            UnitId = 1, // шт.
            StatusId = 1, // DRAFT
            Quantity = planPosition.QuantityPlanned,
            CreatedAt = DateTime.UtcNow,
            Operations = operations
        };

        _context.RoutingSheets.Add(sheet);
        await _context.SaveChangesAsync();

        // Reload with all navigation properties for response
        return await GetById(sheet.Id);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = $"{UserRoles.WorkshopChief},{UserRoles.PlanningDept}")]
    public async Task<IActionResult> ChangeStatus(int id, [FromBody] ChangeStatusDto dto)
    {
        var sheet = await _context.RoutingSheets
            .Include(rs => rs.PlanPosition)
            .FirstOrDefaultAsync(rs => rs.Id == id);
        if (sheet == null)
            return NotFound();

        var statusExists = await _context.RoutingSheetStatuses.AnyAsync(s => s.Id == dto.StatusId);
        if (!statusExists)
            return BadRequest("Указанный статус не найден");

        // Check guild access for WorkshopChief
        var userGuildId = GetCurrentUserGuildId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole == UserRoles.WorkshopChief && userGuildId.HasValue
            && sheet.PlanPosition != null && sheet.PlanPosition.GuildId != userGuildId.Value)
            return Forbid();

        sheet.StatusId = dto.StatusId;
        sheet.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/split")]
    [Authorize(Roles = $"{UserRoles.WorkshopChief},{UserRoles.PlanningDept}")]
    public async Task<ActionResult<object>> Split(int id, [FromBody] SplitQuantityDto dto)
    {
        var sourceSheet = await _context.RoutingSheets
            .Include(rs => rs.Operations)
            .Include(rs => rs.PlanPosition)
            .FirstOrDefaultAsync(rs => rs.Id == id);

        if (sourceSheet == null)
            return NotFound("Исходный маршрутный лист не найден");

        if (dto.SplitQuantity <= 0)
            return BadRequest("Количество для отделения должно быть больше 0");

        if (dto.SplitQuantity >= sourceSheet.Quantity)
            return BadRequest("Количество для отделения должно быть меньше текущего количества МЛ");

        // Check guild access for WorkshopChief
        var userGuildId = GetCurrentUserGuildId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole == UserRoles.WorkshopChief && userGuildId.HasValue
            && sourceSheet.PlanPosition != null && sourceSheet.PlanPosition.GuildId != userGuildId.Value)
            return Forbid();

        var originalQuantity = sourceSheet.Quantity;

        // Validate that all operations can be split into whole numbers
        foreach (var op in sourceSheet.Operations)
        {
            var newOpQty = op.Quantity * dto.SplitQuantity;
            if (newOpQty % originalQuantity != 0)
                return BadRequest($"Операция «{op.Name}» (кол-во {op.Quantity}) не делится нацело при разбиении {dto.SplitQuantity} из {originalQuantity}");
        }

        var remainingQuantity = originalQuantity - dto.SplitQuantity;

        // Generate number for new sheet
        var newNumber = await GenerateRoutingSheetNumber();

        var newSheet = new RoutingSheet
        {
            Number = newNumber,
            Name = sourceSheet.Name,
            PlanPositionId = sourceSheet.PlanPositionId,
            ProductItemId = sourceSheet.ProductItemId,
            UnitId = sourceSheet.UnitId,
            StatusId = 1, // DRAFT
            Quantity = dto.SplitQuantity,
            CreatedAt = DateTime.UtcNow
        };

        _context.RoutingSheets.Add(newSheet);
        await _context.SaveChangesAsync();

        // Split operations proportionally
        int seqNumber = 1;
        foreach (var op in sourceSheet.Operations.OrderBy(o => o.SeqNumber))
        {
            var newOpQuantity = op.Quantity * dto.SplitQuantity / originalQuantity;
            var remainingOpQuantity = op.Quantity - newOpQuantity;

            // Create copy in new sheet
            var newOp = new Operation
            {
                RoutingSheetId = newSheet.Id,
                SeqNumber = seqNumber++,
                Name = op.Name,
                Code = op.Code,
                OperationTypeId = op.OperationTypeId,
                GuildId = op.GuildId,
                PerformerId = null,
                Price = op.Price,
                Quantity = newOpQuantity,
                Sum = op.Price.HasValue ? op.Price.Value * newOpQuantity : null,
                StatusId = op.StatusId
            };
            _context.Operations.Add(newOp);

            // Update original
            op.Quantity = remainingOpQuantity;
            op.Sum = op.Price.HasValue ? op.Price.Value * remainingOpQuantity : null;
        }

        sourceSheet.Quantity = remainingQuantity;
        sourceSheet.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { OriginalId = sourceSheet.Id, NewId = newSheet.Id });
    }

    private int? GetCurrentUserGuildId()
    {
        var guildIdClaim = User.FindFirst("GuildId")?.Value;
        if (guildIdClaim != null && int.TryParse(guildIdClaim, out var guildId))
            return guildId;
        return null;
    }

    private async Task<string> GenerateRoutingSheetNumber()
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"МЛ-{year}-";

        var lastNumber = await _context.RoutingSheets
            .Where(rs => rs.Number.StartsWith(prefix))
            .OrderByDescending(rs => rs.Number)
            .Select(rs => rs.Number)
            .FirstOrDefaultAsync();

        int nextSeq = 1;
        if (lastNumber != null)
        {
            var suffix = lastNumber.Substring(prefix.Length);
            if (int.TryParse(suffix, out var lastSeq))
                nextSeq = lastSeq + 1;
        }

        return $"{prefix}{nextSeq:D4}";
    }
}
