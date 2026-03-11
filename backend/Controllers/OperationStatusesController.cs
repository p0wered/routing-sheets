using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoutingSheetsNew.Data;
using RoutingSheetsNew.DTOs;

namespace RoutingSheetsNew.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OperationStatusesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public OperationStatusesController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Получить список всех статусов операций
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<OperationStatusDto>>> GetAll()
    {
        var statuses = await _context.OperationStatuses
            .Select(s => new OperationStatusDto(s.Id, s.Code, s.Name))
            .ToListAsync();

        return Ok(statuses);
    }

    /// <summary>
    /// Получить статус операции по ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<OperationStatusDto>> GetById(int id)
    {
        var status = await _context.OperationStatuses
            .Where(s => s.Id == id)
            .Select(s => new OperationStatusDto(s.Id, s.Code, s.Name))
            .FirstOrDefaultAsync();

        if (status == null)
            return NotFound();

        return Ok(status);
    }
}

