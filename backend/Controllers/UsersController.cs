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
[Authorize(Roles = UserRoles.WorkshopChief)]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetAll()
    {
        var users = await _context.Users
            .Include(u => u.Guild)
            .OrderBy(u => u.Username)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                FullName = u.FullName,
                Role = u.Role,
                GuildId = u.GuildId,
                GuildName = u.Guild != null ? u.Guild.Name : null
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetById(int id)
    {
        var user = await _context.Users
            .Include(u => u.Guild)
            .FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
            return NotFound("Пользователь не найден");

        return Ok(new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Role = user.Role,
            GuildId = user.GuildId,
            GuildName = user.Guild?.Name
        });
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserDto dto)
    {
        if (!IsValidRole(dto.Role))
            return BadRequest("Недопустимая роль");

        if (dto.Role is UserRoles.WorkshopChief or UserRoles.WorkshopForeman && !dto.GuildId.HasValue)
            return BadRequest("Для роли начальника или мастера цеха необходимо указать цех");

        if (dto.GuildId.HasValue)
        {
            var guildExists = await _context.Guilds.AnyAsync(g => g.Id == dto.GuildId.Value);
            if (!guildExists)
                return BadRequest("Указанный цех не найден");
        }

        if (dto.Role == UserRoles.WorkshopChief && dto.GuildId.HasValue)
        {
            var chiefExists = await _context.Users.AnyAsync(u =>
                u.Role == UserRoles.WorkshopChief && u.GuildId == dto.GuildId.Value);
            if (chiefExists)
                return BadRequest("В этом цехе уже есть начальник");
        }

        var exists = await _context.Users.AnyAsync(u => u.Username == dto.Username);
        if (exists)
            return Conflict("Пользователь с таким логином уже существует");

        var user = new User
        {
            Username = dto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FullName = dto.FullName,
            Role = dto.Role,
            GuildId = dto.Role == UserRoles.PlanningDept ? null : dto.GuildId
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        await _context.Entry(user).Reference(u => u.Guild).LoadAsync();

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Role = user.Role,
            GuildId = user.GuildId,
            GuildName = user.Guild?.Name
        });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> Update(int id, [FromBody] UpdateUserDto dto)
    {
        if (!IsValidRole(dto.Role))
            return BadRequest("Недопустимая роль");

        var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound("Пользователь не найден");

        if (id == currentUserId && user.Role != dto.Role)
            return BadRequest("Нельзя изменить свою роль");

        if (dto.Role is UserRoles.WorkshopChief or UserRoles.WorkshopForeman && !dto.GuildId.HasValue)
            return BadRequest("Для роли начальника или мастера цеха необходимо указать цех");

        if (dto.GuildId.HasValue)
        {
            var guildExists = await _context.Guilds.AnyAsync(g => g.Id == dto.GuildId.Value);
            if (!guildExists)
                return BadRequest("Указанный цех не найден");
        }

        if (dto.Role == UserRoles.WorkshopChief && dto.GuildId.HasValue)
        {
            var chiefExists = await _context.Users.AnyAsync(u =>
                u.Id != id && u.Role == UserRoles.WorkshopChief && u.GuildId == dto.GuildId.Value);
            if (chiefExists)
                return BadRequest("В этом цехе уже есть начальник");
        }

        if (user.Username != dto.Username)
        {
            var exists = await _context.Users.AnyAsync(u => u.Username == dto.Username && u.Id != id);
            if (exists)
                return Conflict("Пользователь с таким логином уже существует");
        }

        user.Username = dto.Username;
        user.FullName = dto.FullName;
        user.Role = dto.Role;
        user.GuildId = dto.Role == UserRoles.PlanningDept ? null : dto.GuildId;

        if (!string.IsNullOrWhiteSpace(dto.Password))
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        await _context.SaveChangesAsync();

        await _context.Entry(user).Reference(u => u.Guild).LoadAsync();

        return Ok(new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Role = user.Role,
            GuildId = user.GuildId,
            GuildName = user.Guild?.Name
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound("Пользователь не найден");

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static bool IsValidRole(string role) =>
        role is UserRoles.WorkshopChief
            or UserRoles.WorkshopForeman
            or UserRoles.PlanningDept;
}
