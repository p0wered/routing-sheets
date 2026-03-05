using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoutingSheetsNew.Data;
using RoutingSheetsNew.DTOs;
using RoutingSheetsNew.Models;

namespace RoutingSheetsNew.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OperationTypesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public OperationTypesController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Получить список всех типов операций
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<OperationTypeDto>>> GetAll()
    {
        var types = await _context.OperationTypes
            .Select(t => new OperationTypeDto(t.Id, t.Name))
            .ToListAsync();

        return Ok(types);
    }

    /// <summary>
    /// Получить тип операции по ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<OperationTypeDto>> GetById(int id)
    {
        var type = await _context.OperationTypes
            .Where(t => t.Id == id)
            .Select(t => new OperationTypeDto(t.Id, t.Name))
            .FirstOrDefaultAsync();

        if (type == null)
            return NotFound();

        return Ok(type);
    }

    /// <summary>
    /// Создать новый тип операции
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<OperationTypeDto>> Create([FromBody] CreateOperationTypeDto dto)
    {
        var type = new OperationType { Name = dto.Name };
        
        _context.OperationTypes.Add(type);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = type.Id }, new OperationTypeDto(type.Id, type.Name));
    }

    /// <summary>
    /// Обновить тип операции
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateOperationTypeDto dto)
    {
        var type = await _context.OperationTypes.FindAsync(id);
        if (type == null)
            return NotFound();

        type.Name = dto.Name;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Удалить тип операции
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var type = await _context.OperationTypes.FindAsync(id);
        if (type == null)
            return NotFound();

        // Check if type is used
        var isUsed = await _context.Operations.AnyAsync(o => o.OperationTypeId == id);
        if (isUsed)
            return BadRequest("Тип операции используется и не может быть удален");

        _context.OperationTypes.Remove(type);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

