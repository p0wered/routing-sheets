using Microsoft.EntityFrameworkCore;
using RoutingSheetsNew.Models;

namespace RoutingSheetsNew.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Unit> Units { get; set; }
    public DbSet<RoutingSheetStatus> RoutingSheetStatuses { get; set; }
    public DbSet<OperationStatus> OperationStatuses { get; set; }
    public DbSet<Guild> Guilds { get; set; }
    public DbSet<OperationType> OperationTypes { get; set; }
    public DbSet<Performer> Performers { get; set; }
    public DbSet<ProductItem> ProductItems { get; set; }
    public DbSet<PlanPosition> PlanPositions { get; set; }
    public DbSet<RoutingSheet> RoutingSheets { get; set; }
    public DbSet<Operation> Operations { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Part> Parts { get; set; }
    public DbSet<PartOperation> PartOperations { get; set; }
    public DbSet<ProductPart> ProductParts { get; set; }
    public DbSet<PlanStatus> PlanStatuses { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ──────────────── Relationships ────────────────

        // PlanPosition -> ProductItem
        modelBuilder.Entity<PlanPosition>()
            .HasOne(p => p.ProductItem)
            .WithMany(pi => pi.PlanPositions)
            .HasForeignKey(p => p.ProductItemId)
            .OnDelete(DeleteBehavior.Restrict);

        // PlanPosition -> Guild
        modelBuilder.Entity<PlanPosition>()
            .HasOne(p => p.Guild)
            .WithMany(g => g.PlanPositions)
            .HasForeignKey(p => p.GuildId)
            .OnDelete(DeleteBehavior.Restrict);

        // PlanPosition -> PlanStatus
        modelBuilder.Entity<PlanPosition>()
            .HasOne(p => p.Status)
            .WithMany(s => s.PlanPositions)
            .HasForeignKey(p => p.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        // RoutingSheet -> PlanPosition
        modelBuilder.Entity<RoutingSheet>()
            .HasOne(rs => rs.PlanPosition)
            .WithMany(pp => pp.RoutingSheets)
            .HasForeignKey(rs => rs.PlanPositionId)
            .OnDelete(DeleteBehavior.Restrict);

        // RoutingSheet -> ProductItem
        modelBuilder.Entity<RoutingSheet>()
            .HasOne(rs => rs.ProductItem)
            .WithMany(pi => pi.RoutingSheets)
            .HasForeignKey(rs => rs.ProductItemId)
            .OnDelete(DeleteBehavior.Restrict);

        // RoutingSheet -> Unit
        modelBuilder.Entity<RoutingSheet>()
            .HasOne(rs => rs.Unit)
            .WithMany(u => u.RoutingSheets)
            .HasForeignKey(rs => rs.UnitId)
            .OnDelete(DeleteBehavior.Restrict);

        // RoutingSheet -> RoutingSheetStatus
        modelBuilder.Entity<RoutingSheet>()
            .HasOne(rs => rs.Status)
            .WithMany(s => s.RoutingSheets)
            .HasForeignKey(rs => rs.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        // Operation -> RoutingSheet
        modelBuilder.Entity<Operation>()
            .HasOne(o => o.RoutingSheet)
            .WithMany(rs => rs.Operations)
            .HasForeignKey(o => o.RoutingSheetId)
            .OnDelete(DeleteBehavior.Cascade);

        // Operation -> OperationStatus
        modelBuilder.Entity<Operation>()
            .HasOne(o => o.Status)
            .WithMany(s => s.Operations)
            .HasForeignKey(o => o.StatusId)
            .OnDelete(DeleteBehavior.Restrict);

        // Operation -> Guild
        modelBuilder.Entity<Operation>()
            .HasOne(o => o.Guild)
            .WithMany(g => g.Operations)
            .HasForeignKey(o => o.GuildId)
            .OnDelete(DeleteBehavior.Restrict);

        // Operation -> OperationType
        modelBuilder.Entity<Operation>()
            .HasOne(o => o.OperationType)
            .WithMany(ot => ot.Operations)
            .HasForeignKey(o => o.OperationTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Operation -> Performer
        modelBuilder.Entity<Operation>()
            .HasOne(o => o.Performer)
            .WithMany(p => p.Operations)
            .HasForeignKey(o => o.PerformerId)
            .OnDelete(DeleteBehavior.Restrict);

        // User -> Guild
        modelBuilder.Entity<User>()
            .HasOne(u => u.Guild)
            .WithMany(g => g.Users)
            .HasForeignKey(u => u.GuildId)
            .OnDelete(DeleteBehavior.Restrict);

        // PartOperation -> Part
        modelBuilder.Entity<PartOperation>()
            .HasOne(po => po.Part)
            .WithMany(p => p.PartOperations)
            .HasForeignKey(po => po.PartId)
            .OnDelete(DeleteBehavior.Cascade);

        // PartOperation -> OperationType
        modelBuilder.Entity<PartOperation>()
            .HasOne(po => po.OperationType)
            .WithMany(ot => ot.PartOperations)
            .HasForeignKey(po => po.OperationTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        // PartOperation -> Guild
        modelBuilder.Entity<PartOperation>()
            .HasOne(po => po.Guild)
            .WithMany(g => g.PartOperations)
            .HasForeignKey(po => po.GuildId)
            .OnDelete(DeleteBehavior.Restrict);

        // ProductPart -> ProductItem
        modelBuilder.Entity<ProductPart>()
            .HasOne(pp => pp.ProductItem)
            .WithMany(pi => pi.ProductParts)
            .HasForeignKey(pp => pp.ProductItemId)
            .OnDelete(DeleteBehavior.Cascade);

        // ProductPart -> Part
        modelBuilder.Entity<ProductPart>()
            .HasOne(pp => pp.Part)
            .WithMany(p => p.ProductParts)
            .HasForeignKey(pp => pp.PartId)
            .OnDelete(DeleteBehavior.Restrict);

        // ──────────────── Indexes ────────────────

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<RoutingSheet>()
            .HasIndex(rs => rs.Number)
            .IsUnique();

        modelBuilder.Entity<PlanPosition>()
            .HasIndex(pp => pp.PositionCode);

        modelBuilder.Entity<PlanPosition>()
            .HasIndex(pp => new { pp.GuildId, pp.PlanYear, pp.PlanMonth });

        modelBuilder.Entity<Operation>()
            .HasIndex(o => new { o.RoutingSheetId, o.SeqNumber });

        modelBuilder.Entity<ProductPart>()
            .HasIndex(pp => new { pp.ProductItemId, pp.PartId })
            .IsUnique();

        modelBuilder.Entity<PartOperation>()
            .HasIndex(po => new { po.PartId, po.SeqNumber });

        // ──────────────── Seed data ────────────────

        // Statuses
        modelBuilder.Entity<RoutingSheetStatus>().HasData(
            new RoutingSheetStatus { Id = 1, Code = "DRAFT", Name = "Черновик" },
            new RoutingSheetStatus { Id = 2, Code = "ACTIVE", Name = "Активен" },
            new RoutingSheetStatus { Id = 3, Code = "COMPLETED", Name = "Завершен" },
            new RoutingSheetStatus { Id = 4, Code = "CANCELLED", Name = "Отменен" }
        );

        modelBuilder.Entity<OperationStatus>().HasData(
            new OperationStatus { Id = 1, Code = "PENDING", Name = "Ожидает" },
            new OperationStatus { Id = 2, Code = "IN_PROGRESS", Name = "В работе" },
            new OperationStatus { Id = 3, Code = "COMPLETED", Name = "Завершена" },
            new OperationStatus { Id = 4, Code = "CANCELLED", Name = "Отменена" }
        );

        modelBuilder.Entity<PlanStatus>().HasData(
            new PlanStatus { Id = 1, Code = "OPEN", Name = "Открыт" },
            new PlanStatus { Id = 2, Code = "CLOSED", Name = "Закрыт" }
        );

        // Units
        modelBuilder.Entity<Unit>().HasData(
            new Unit { Id = 1, Name = "шт." },
            new Unit { Id = 2, Name = "кг" },
            new Unit { Id = 3, Name = "м" }
        );

        // Guilds
        modelBuilder.Entity<Guild>().HasData(
            new Guild { Id = 1, Name = "Сборочный цех №1" },
            new Guild { Id = 2, Name = "Механический цех №2" },
            new Guild { Id = 3, Name = "Сварочный цех №3" }
        );

        // OperationTypes
        modelBuilder.Entity<OperationType>().HasData(
            new OperationType { Id = 1, Name = "Сборка" },
            new OperationType { Id = 2, Name = "Сварка" },
            new OperationType { Id = 3, Name = "Токарная обработка" },
            new OperationType { Id = 4, Name = "Фрезерная обработка" },
            new OperationType { Id = 5, Name = "Контроль качества" }
        );

        // Performers
        modelBuilder.Entity<Performer>().HasData(
            new Performer { Id = 1, FullName = "Иванов Иван Иванович", Role = "Слесарь-сборщик" },
            new Performer { Id = 2, FullName = "Петров Петр Петрович", Role = "Сварщик" },
            new Performer { Id = 3, FullName = "Сидоров Сидор Сидорович", Role = "Токарь" }
        );

        // ProductItems (removed QuantityPlanned)
        modelBuilder.Entity<ProductItem>().HasData(
            new ProductItem { Id = 1, Name = "Корпус редуктора", Description = "Корпус для промышленного редуктора РМ-500" },
            new ProductItem { Id = 2, Name = "Вал приводной", Description = "Приводной вал для станка" },
            new ProductItem { Id = 3, Name = "Шестерня ведущая", Description = "Ведущая шестерня z=24" }
        );

        // Parts
        modelBuilder.Entity<Part>().HasData(
            new Part { Id = 1, Name = "Корпус", Description = "Основной корпус изделия" },
            new Part { Id = 2, Name = "Крышка", Description = "Крышка корпуса" },
            new Part { Id = 3, Name = "Вал", Description = "Приводной вал" },
            new Part { Id = 4, Name = "Шестерня", Description = "Ведущая шестерня" },
            new Part { Id = 5, Name = "Подшипник", Description = "Опорный подшипник" },
            new Part { Id = 6, Name = "Болт М6", Description = "Крепёжный болт М6" }
        );

        // PartOperations
        modelBuilder.Entity<PartOperation>().HasData(
            // Корпус: 2 операции
            new PartOperation { Id = 1, PartId = 1, SeqNumber = 1, Name = "Фрезеровка корпуса", Code = "ПО-001", OperationTypeId = 4, GuildId = 2, Price = 300.00m },
            new PartOperation { Id = 2, PartId = 1, SeqNumber = 2, Name = "Контроль корпуса", Code = "ПО-002", OperationTypeId = 5, GuildId = 2, Price = 50.00m },
            // Крышка: 2 операции
            new PartOperation { Id = 3, PartId = 2, SeqNumber = 1, Name = "Штамповка заготовки крышки", Code = "ПО-003", OperationTypeId = 1, GuildId = 1, Price = 30.00m },
            new PartOperation { Id = 4, PartId = 2, SeqNumber = 2, Name = "Шлифовка крышки", Code = "ПО-004", OperationTypeId = 4, GuildId = 2, Price = 20.00m },
            // Вал: 1 операция
            new PartOperation { Id = 5, PartId = 3, SeqNumber = 1, Name = "Токарная обработка вала", Code = "ПО-005", OperationTypeId = 3, GuildId = 2, Price = 250.00m },
            // Шестерня: 2 операции
            new PartOperation { Id = 6, PartId = 4, SeqNumber = 1, Name = "Фрезеровка шестерни", Code = "ПО-006", OperationTypeId = 4, GuildId = 2, Price = 180.00m },
            new PartOperation { Id = 7, PartId = 4, SeqNumber = 2, Name = "Термообработка шестерни", Code = "ПО-007", OperationTypeId = 2, GuildId = 3, Price = 100.00m },
            // Подшипник: 1 операция
            new PartOperation { Id = 8, PartId = 5, SeqNumber = 1, Name = "Контроль подшипника", Code = "ПО-008", OperationTypeId = 5, GuildId = 1, Price = 20.00m },
            // Болт М6: 1 операция
            new PartOperation { Id = 9, PartId = 6, SeqNumber = 1, Name = "Токарная обработка болта", Code = "ПО-009", OperationTypeId = 3, GuildId = 2, Price = 10.00m }
        );

        // ProductParts (состав изделий)
        modelBuilder.Entity<ProductPart>().HasData(
            // Корпус редуктора: Корпус ×1, Крышка ×2, Болт М6 ×8
            new ProductPart { Id = 1, ProductItemId = 1, PartId = 1, Quantity = 1 },
            new ProductPart { Id = 2, ProductItemId = 1, PartId = 2, Quantity = 2 },
            new ProductPart { Id = 3, ProductItemId = 1, PartId = 6, Quantity = 8 },
            // Вал приводной: Вал ×1, Подшипник ×2
            new ProductPart { Id = 4, ProductItemId = 2, PartId = 3, Quantity = 1 },
            new ProductPart { Id = 5, ProductItemId = 2, PartId = 5, Quantity = 2 },
            // Шестерня ведущая: Шестерня ×1
            new ProductPart { Id = 6, ProductItemId = 3, PartId = 4, Quantity = 1 }
        );

        // PlanPositions (with guild, month/year, status)
        modelBuilder.Entity<PlanPosition>().HasData(
            // Январь 2026
            new PlanPosition { Id = 1, DocumentNumber = "ПП-2026-001", DocumentDate = new DateTime(2026, 1, 10), PlanMonth = 1, PlanYear = 2026, PositionCode = "ПП-2026-001", Name = "Производство корпусов, январь", ProductItemId = 1, QuantityPlanned = 25, GuildId = 1, StatusId = 1 },
            new PlanPosition { Id = 2, DocumentNumber = "ПП-2026-002", DocumentDate = new DateTime(2026, 1, 10), PlanMonth = 1, PlanYear = 2026, PositionCode = "ПП-2026-002", Name = "Производство валов, январь", ProductItemId = 2, QuantityPlanned = 15, GuildId = 2, StatusId = 1 },
            new PlanPosition { Id = 3, DocumentNumber = "ПП-2026-003", DocumentDate = new DateTime(2026, 1, 10), PlanMonth = 1, PlanYear = 2026, PositionCode = "ПП-2026-003", Name = "Производство шестерен, январь", ProductItemId = 3, QuantityPlanned = 50, GuildId = 2, StatusId = 1 },
            // Февраль 2026
            new PlanPosition { Id = 4, DocumentNumber = "ПП-2026-004", DocumentDate = new DateTime(2026, 2, 5), PlanMonth = 2, PlanYear = 2026, PositionCode = "ПП-2026-004", Name = "Производство корпусов, февраль", ProductItemId = 1, QuantityPlanned = 30, GuildId = 1, StatusId = 1 },
            new PlanPosition { Id = 5, DocumentNumber = "ПП-2026-005", DocumentDate = new DateTime(2026, 2, 5), PlanMonth = 2, PlanYear = 2026, PositionCode = "ПП-2026-005", Name = "Производство валов, февраль", ProductItemId = 2, QuantityPlanned = 20, GuildId = 2, StatusId = 1 },
            new PlanPosition { Id = 6, DocumentNumber = "ПП-2026-006", DocumentDate = new DateTime(2026, 2, 5), PlanMonth = 2, PlanYear = 2026, PositionCode = "ПП-2026-006", Name = "Производство шестерен, февраль", ProductItemId = 3, QuantityPlanned = 40, GuildId = 2, StatusId = 1 },
            new PlanPosition { Id = 7, DocumentNumber = "ПП-2026-007", DocumentDate = new DateTime(2026, 2, 5), PlanMonth = 2, PlanYear = 2026, PositionCode = "ПП-2026-007", Name = "Производство корпусов (доп.), февраль", ProductItemId = 1, QuantityPlanned = 10, GuildId = 1, StatusId = 1 }
        );

        // RoutingSheets — пустые (формируются автоматически через API)
        // Operations — пустые (формируются вместе с МЛ)
    }
}
