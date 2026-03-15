using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RoutingSheetsNew.Data;
using RoutingSheetsNew.DTOs;

namespace RoutingSheetsNew.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PlanStatusesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PlanStatusesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PlanStatusDto>>> GetAll()
    {
        var statuses = await _context.PlanStatuses
            .OrderBy(s => s.Id)
            .Select(s => new PlanStatusDto(s.Id, s.Code, s.Name))
            .ToListAsync();

        return Ok(statuses);
    }
}
