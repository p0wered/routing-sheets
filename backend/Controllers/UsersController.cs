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
            .OrderBy(u => u.Username)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.Username,
                FullName = u.FullName,
                Role = u.Role
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetById(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound("Пользователь не найден");

        return Ok(new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Role = user.Role
        });
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserDto dto)
    {
        if (!IsValidRole(dto.Role))
            return BadRequest("Недопустимая роль");

        var exists = await _context.Users.AnyAsync(u => u.Username == dto.Username);
        if (exists)
            return Conflict("Пользователь с таким логином уже существует");

        var user = new User
        {
            Username = dto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FullName = dto.Username,
            Role = dto.Role
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Role = user.Role
        });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> Update(int id, [FromBody] UpdateUserDto dto)
    {
        if (!IsValidRole(dto.Role))
            return BadRequest("Недопустимая роль");

        var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound("Пользователь не найден");

        if (id == currentUserId && user.Role != dto.Role)
            return BadRequest("Нельзя изменить свою роль");

        if (user.Username != dto.Username)
        {
            var exists = await _context.Users.AnyAsync(u => u.Username == dto.Username && u.Id != id);
            if (exists)
                return Conflict("Пользователь с таким логином уже существует");
        }

        user.Username = dto.Username;
        user.FullName = dto.Username;
        user.Role = dto.Role;

        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        }

        await _context.SaveChangesAsync();

        return Ok(new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            FullName = user.FullName,
            Role = user.Role
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
