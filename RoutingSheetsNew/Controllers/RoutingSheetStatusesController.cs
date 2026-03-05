using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoutingSheetsNew.Data;
using RoutingSheetsNew.DTOs;

namespace RoutingSheetsNew.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoutingSheetStatusesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RoutingSheetStatusesController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Получить список всех статусов маршрутных листов
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoutingSheetStatusDto>>> GetAll()
    {
        var statuses = await _context.RoutingSheetStatuses
            .Select(s => new RoutingSheetStatusDto(s.Id, s.Code, s.Name))
            .ToListAsync();

        return Ok(statuses);
    }

    /// <summary>
    /// Получить статус маршрутного листа по ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<RoutingSheetStatusDto>> GetById(int id)
    {
        var status = await _context.RoutingSheetStatuses
            .Where(s => s.Id == id)
            .Select(s => new RoutingSheetStatusDto(s.Id, s.Code, s.Name))
            .FirstOrDefaultAsync();

        if (status == null)
            return NotFound();

        return Ok(status);
    }
}

