using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoutingSheetsNew.Data;
using RoutingSheetsNew.DTOs;
using RoutingSheetsNew.Models;

namespace RoutingSheetsNew.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlanPositionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PlanPositionsController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Получить список всех позиций плана производства
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PlanPositionListDto>>> GetAll()
    {
        var positions = await _context.PlanPositions
            .OrderByDescending(p => p.DocumentDate)
            .ThenByDescending(p => p.Id)
            .Select(p => new PlanPositionListDto(
                p.Id,
                p.DocumentNumber,
                p.DocumentDate,
                p.PlanningPeriod,
                p.PositionCode,
                p.Name,
                p.ProductItemId,
                p.QuantityPlanned))
            .ToListAsync();

        return Ok(positions);
    }

    /// <summary>
    /// Получить позицию плана производства по ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<PlanPositionDto>> GetById(int id)
    {
        var position = await _context.PlanPositions
            .Include(p => p.ProductItem)
            .Where(p => p.Id == id)
            .Select(p => new PlanPositionDto(
                p.Id,
                p.DocumentNumber,
                p.DocumentDate,
                p.PlanningPeriod,
                p.PositionCode,
                p.Name,
                p.ProductItemId,
                p.QuantityPlanned,
                p.ProductItem != null 
                    ? new ProductItemDto(p.ProductItem.Id, p.ProductItem.Name, p.ProductItem.Description, p.ProductItem.QuantityPlanned)
                    : null))
            .FirstOrDefaultAsync();

        if (position == null)
            return NotFound();

        return Ok(position);
    }

    /// <summary>
    /// Создать новую позицию плана производства
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<PlanPositionListDto>> Create([FromBody] CreatePlanPositionDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.DocumentNumber))
        {
            return BadRequest("Номер документа обязателен");
        }

        // simple uniqueness check for document number
        var documentExists = await _context.PlanPositions
            .AnyAsync(p => p.DocumentNumber == dto.DocumentNumber);
        if (documentExists)
        {
            return BadRequest("План производства с таким номером документа уже существует");
        }

        // Verify ProductItem exists
        var productItemExists = await _context.ProductItems.AnyAsync(p => p.Id == dto.ProductItemId);
        if (!productItemExists)
            return BadRequest("Указанное изделие не найдено");

        var position = new PlanPosition
        {
            DocumentNumber = dto.DocumentNumber.Trim(),
            DocumentDate = dto.DocumentDate.Date,
            PlanningPeriod = string.IsNullOrWhiteSpace(dto.PlanningPeriod) ? null : dto.PlanningPeriod.Trim(),
            PositionCode = dto.PositionCode,
            Name = dto.Name,
            ProductItemId = dto.ProductItemId,
            QuantityPlanned = dto.QuantityPlanned
        };

        _context.PlanPositions.Add(position);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = position.Id },
            new PlanPositionListDto(
                position.Id,
                position.DocumentNumber,
                position.DocumentDate,
                position.PlanningPeriod,
                position.PositionCode,
                position.Name,
                position.ProductItemId,
                position.QuantityPlanned));
    }

    /// <summary>
    /// Обновить позицию плана производства
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePlanPositionDto dto)
    {
        var position = await _context.PlanPositions.FindAsync(id);
        if (position == null)
            return NotFound();

        if (string.IsNullOrWhiteSpace(dto.DocumentNumber))
        {
            return BadRequest("Номер документа обязателен");
        }

        var documentExists = await _context.PlanPositions
            .AnyAsync(p => p.Id != id && p.DocumentNumber == dto.DocumentNumber);
        if (documentExists)
        {
            return BadRequest("План производства с таким номером документа уже существует");
        }

        // Verify ProductItem exists
        var productItemExists = await _context.ProductItems.AnyAsync(p => p.Id == dto.ProductItemId);
        if (!productItemExists)
            return BadRequest("Указанное изделие не найдено");

        position.DocumentNumber = dto.DocumentNumber.Trim();
        position.DocumentDate = dto.DocumentDate.Date;
        position.PlanningPeriod = string.IsNullOrWhiteSpace(dto.PlanningPeriod) ? null : dto.PlanningPeriod.Trim();
        position.PositionCode = dto.PositionCode;
        position.Name = dto.Name;
        position.ProductItemId = dto.ProductItemId;
        position.QuantityPlanned = dto.QuantityPlanned;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Удалить позицию плана производства
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var position = await _context.PlanPositions.FindAsync(id);
        if (position == null)
            return NotFound();

        // Check if position is used in routing sheets
        var isUsed = await _context.RoutingSheets.AnyAsync(rs => rs.PlanPositionId == id);
        if (isUsed)
            return BadRequest("Позиция плана используется в маршрутных листах и не может быть удалена");

        _context.PlanPositions.Remove(position);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

