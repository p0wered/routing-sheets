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
        [FromQuery] int? partId = null,
        [FromQuery] int? guildId = null,
        [FromQuery] DateTime? createdFrom = null,
        [FromQuery] DateTime? createdTo = null)
    {
        var query = _context.RoutingSheets
            .Include(rs => rs.Status)
            .Include(rs => rs.PlanPosition).ThenInclude(pp => pp!.ProductItem)
            .Include(rs => rs.Part)
            .Include(rs => rs.Unit)
            .AsQueryable();

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
            query = query.Where(rs => rs.PlanPosition != null && rs.PlanPosition.ProductItemId == productItemId.Value);

        if (partId.HasValue)
            query = query.Where(rs => rs.PartId == partId.Value);

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
                rs.PartId,
                rs.StatusId,
                rs.Quantity,
                rs.CreatedAt,
                rs.Status != null ? rs.Status.Name : null,
                rs.PlanPosition != null ? rs.PlanPosition.Name : null,
                rs.PlanPosition != null && rs.PlanPosition.ProductItem != null ? rs.PlanPosition.ProductItem.Name : null,
                rs.Part != null ? rs.Part.Name : null,
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
            .Include(rs => rs.Part)
            .Include(rs => rs.Unit)
            .Include(rs => rs.Operations).ThenInclude(o => o.Status)
            .Include(rs => rs.Operations).ThenInclude(o => o.Performer)
            .Where(rs => rs.Id == id)
            .FirstOrDefaultAsync();

        if (sheet == null)
            return NotFound();

        return Ok(MapRoutingSheetDto(sheet));
    }

    [HttpPost("generate/{planPositionId}")]
    [Authorize(Roles = $"{UserRoles.WorkshopChief},{UserRoles.PlanningDept}")]
    public async Task<ActionResult<IEnumerable<RoutingSheetDto>>> Generate(int planPositionId)
    {
        var planPosition = await _context.PlanPositions
            .Include(pp => pp.ProductItem)
            .Include(pp => pp.Guild)
            .Include(pp => pp.Status)
            .FirstOrDefaultAsync(pp => pp.Id == planPositionId);

        if (planPosition == null)
            return NotFound("Позиция плана не найдена");

        if (planPosition.StatusId != 1)
            return BadRequest("План должен быть в статусе «Открыт»");

        var existingSheet = await _context.RoutingSheets
            .AnyAsync(rs => rs.PlanPositionId == planPositionId);
        if (existingSheet)
            return BadRequest("Для этого плана уже сформированы маршрутные листы");

        var userGuildId = GetCurrentUserGuildId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole == UserRoles.WorkshopChief && userGuildId.HasValue && planPosition.GuildId != userGuildId.Value)
            return Forbid();

        var productParts = await _context.ProductParts
            .Include(pp => pp.Part)
                .ThenInclude(p => p!.PartOperations)
            .Where(pp => pp.ProductItemId == planPosition.ProductItemId)
            .OrderBy(pp => pp.PartId)
            .ToListAsync();

        if (productParts.Count == 0)
            return BadRequest("Для изделия не задан состав деталей");

        var createdSheetIds = new List<int>();

        foreach (var productPart in productParts)
        {
            if (productPart.Part == null)
                continue;

            var partOperations = productPart.Part.PartOperations
                .OrderBy(po => po.SeqNumber)
                .ToList();

            if (partOperations.Count == 0)
                return BadRequest($"Для детали «{productPart.Part.Name}» не заданы технологические операции");

            var detailQuantity = productPart.Quantity * planPosition.QuantityPlanned;
            var operations = new List<Operation>();
            var seqNumber = 1;

            foreach (var partOp in partOperations)
            {
                operations.Add(new Operation
                {
                    SeqNumber = seqNumber++,
                    Name = partOp.Name,
                    Code = partOp.Code,
                    Price = partOp.Price,
                    Quantity = detailQuantity,
                    StatusId = 1
                });
            }

            var number = await GenerateRoutingSheetNumber();

            var sheet = new RoutingSheet
            {
                Number = number,
                Name = $"МЛ на деталь {productPart.Part.Name}",
                PlanPositionId = planPositionId,
                PartId = productPart.PartId,
                UnitId = 1,
                StatusId = 1,
                Quantity = detailQuantity,
                CreatedAt = DateTime.UtcNow,
                Operations = operations
            };

            _context.RoutingSheets.Add(sheet);
            await _context.SaveChangesAsync();
            createdSheetIds.Add(sheet.Id);
        }

        var createdSheets = await _context.RoutingSheets
            .Include(rs => rs.Status)
            .Include(rs => rs.PlanPosition).ThenInclude(pp => pp!.Guild)
            .Include(rs => rs.PlanPosition).ThenInclude(pp => pp!.Status)
            .Include(rs => rs.PlanPosition).ThenInclude(pp => pp!.ProductItem)
            .Include(rs => rs.Part)
            .Include(rs => rs.Unit)
            .Include(rs => rs.Operations).ThenInclude(o => o.Status)
            .Include(rs => rs.Operations).ThenInclude(o => o.Performer)
            .Where(rs => createdSheetIds.Contains(rs.Id))
            .OrderBy(rs => rs.Id)
            .ToListAsync();

        return Ok(createdSheets.Select(MapRoutingSheetDto).ToList());
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

        var userGuildId = GetCurrentUserGuildId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (userRole == UserRoles.WorkshopChief && userGuildId.HasValue
            && sourceSheet.PlanPosition != null && sourceSheet.PlanPosition.GuildId != userGuildId.Value)
            return Forbid();

        var originalQuantity = sourceSheet.Quantity;

        foreach (var op in sourceSheet.Operations)
        {
            var newOpQty = op.Quantity * dto.SplitQuantity;
            if (newOpQty % originalQuantity != 0)
                return BadRequest($"Операция «{op.Name}» (кол-во {op.Quantity}) не делится нацело при разбиении {dto.SplitQuantity} из {originalQuantity}");
        }

        var remainingQuantity = originalQuantity - dto.SplitQuantity;
        var newNumber = await GenerateRoutingSheetNumber();

        var newSheet = new RoutingSheet
        {
            Number = newNumber,
            Name = sourceSheet.Name,
            PlanPositionId = sourceSheet.PlanPositionId,
            PartId = sourceSheet.PartId,
            UnitId = sourceSheet.UnitId,
            StatusId = 1,
            Quantity = dto.SplitQuantity,
            CreatedAt = DateTime.UtcNow
        };

        _context.RoutingSheets.Add(newSheet);
        await _context.SaveChangesAsync();

        var seqNumber = 1;
        foreach (var op in sourceSheet.Operations.OrderBy(o => o.SeqNumber))
        {
            var newOpQuantity = op.Quantity * dto.SplitQuantity / originalQuantity;
            var remainingOpQuantity = op.Quantity - newOpQuantity;

            var newOp = new Operation
            {
                RoutingSheetId = newSheet.Id,
                SeqNumber = seqNumber++,
                Name = op.Name,
                Code = op.Code,
                PerformerId = null,
                Price = op.Price,
                Quantity = newOpQuantity,
                StatusId = op.StatusId
            };
            _context.Operations.Add(newOp);

            op.Quantity = remainingOpQuantity;
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

        var nextSeq = 1;
        if (lastNumber != null)
        {
            var suffix = lastNumber[prefix.Length..];
            if (int.TryParse(suffix, out var lastSeq))
                nextSeq = lastSeq + 1;
        }

        return $"{prefix}{nextSeq:D4}";
    }

    private static RoutingSheetDto MapRoutingSheetDto(RoutingSheet sheet)
    {
        return new RoutingSheetDto(
            sheet.Id,
            sheet.Number,
            sheet.Name,
            sheet.PlanPositionId,
            sheet.PartId,
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
            sheet.PlanPosition?.ProductItem != null
                ? new ProductItemDto(
                    sheet.PlanPosition.ProductItem.Id,
                    sheet.PlanPosition.ProductItem.Name,
                    sheet.PlanPosition.ProductItem.Description)
                : null,
            sheet.Part != null
                ? new PartRefDto(sheet.Part.Id, sheet.Part.Name, sheet.Part.Description)
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
                o.PerformerId,
                o.Price,
                o.Quantity,
                o.Status != null ? new OperationStatusDto(o.Status.Id, o.Status.Code, o.Status.Name) : null,
                sheet.PlanPosition?.Guild != null ? new GuildDto(sheet.PlanPosition.Guild.Id, sheet.PlanPosition.Guild.Name) : null,
                o.Performer != null ? new PerformerDto(o.Performer.Id, o.Performer.FullName, o.Performer.Role) : null
            )).ToList());
    }
}
