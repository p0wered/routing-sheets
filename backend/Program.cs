using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RoutingSheetsNew.Data;
using RoutingSheetsNew.Models;

var builder = WebApplication.CreateBuilder(args);

// Database (SQLite file under project ContentRoot / Data — path resolved so it is not tied to bin/)
var sqliteConnectionString = ResolveSqliteConnectionString(
    builder.Configuration.GetConnectionString("DefaultConnection")!,
    builder.Environment.ContentRootPath);
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(sqliteConnectionString));

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.MapInboundClaims = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Routing Sheets API",
        Version = "v1",
        Description = "API для формирования маршрутных листов по изделиям на заводе"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Введите JWT-токен"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Migrate DB and seed default user
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();

    if (!dbContext.Users.Any())
    {
        dbContext.Users.AddRange(
            new User
            {
                Username = "chief1",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("chief123"),
                FullName = "Иванов Иван Петрович",
                Role = UserRoles.WorkshopChief,
                GuildId = 1
            },
            new User
            {
                Username = "chief2",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("chief123"),
                FullName = "Козлов Андрей Сергеевич",
                Role = UserRoles.WorkshopChief,
                GuildId = 2
            },
            new User
            {
                Username = "foreman1",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("foreman123"),
                FullName = "Сидоров Алексей Николаевич",
                Role = UserRoles.WorkshopForeman,
                GuildId = 1
            },
            new User
            {
                Username = "planner",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("planner123"),
                FullName = "Петрова Мария Ивановна",
                Role = UserRoles.PlanningDept,
                GuildId = null
            }
        );
        dbContext.SaveChanges();
    }
}

app.Run();

static string ResolveSqliteConnectionString(string connectionString, string contentRoot)
{
    const string prefix = "Data Source=";
    if (!connectionString.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
        return connectionString;
    var relativePath = connectionString[prefix.Length..].Trim();
    if (Path.IsPathRooted(relativePath))
        return connectionString;
    var fullPath = Path.GetFullPath(Path.Combine(contentRoot, relativePath));
    var directory = Path.GetDirectoryName(fullPath);
    if (!string.IsNullOrEmpty(directory))
        Directory.CreateDirectory(directory);
    return $"{prefix}{fullPath}";
}
