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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships

        // PlanPosition -> ProductItem
        modelBuilder.Entity<PlanPosition>()
            .HasOne(p => p.ProductItem)
            .WithMany(pi => pi.PlanPositions)
            .HasForeignKey(p => p.ProductItemId)
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

        // Seed data for statuses (these are immutable)
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

        // Seed test data for Units
        modelBuilder.Entity<Unit>().HasData(
            new Unit { Id = 1, Name = "шт." },
            new Unit { Id = 2, Name = "кг" },
            new Unit { Id = 3, Name = "м" }
        );

        // Seed test data for Guilds
        modelBuilder.Entity<Guild>().HasData(
            new Guild { Id = 1, Name = "Сборочный цех №1" },
            new Guild { Id = 2, Name = "Механический цех №2" },
            new Guild { Id = 3, Name = "Сварочный цех №3" }
        );

        // Seed test data for OperationTypes
        modelBuilder.Entity<OperationType>().HasData(
            new OperationType { Id = 1, Name = "Сборка" },
            new OperationType { Id = 2, Name = "Сварка" },
            new OperationType { Id = 3, Name = "Токарная обработка" },
            new OperationType { Id = 4, Name = "Фрезерная обработка" },
            new OperationType { Id = 5, Name = "Контроль качества" }
        );

        // Seed test data for Performers
        modelBuilder.Entity<Performer>().HasData(
            new Performer { Id = 1, FullName = "Иванов Иван Иванович", Role = "Слесарь-сборщик" },
            new Performer { Id = 2, FullName = "Петров Петр Петрович", Role = "Сварщик" },
            new Performer { Id = 3, FullName = "Сидоров Сидор Сидорович", Role = "Токарь" }
        );

        // Seed test data for ProductItems
        modelBuilder.Entity<ProductItem>().HasData(
            new ProductItem { Id = 1, Name = "Корпус редуктора", Description = "Корпус для промышленного редуктора РМ-500", QuantityPlanned = 100 },
            new ProductItem { Id = 2, Name = "Вал приводной", Description = "Приводной вал для станка", QuantityPlanned = 50 },
            new ProductItem { Id = 3, Name = "Шестерня ведущая", Description = "Ведущая шестерня z=24", QuantityPlanned = 200 }
        );

        // Seed test data for PlanPositions
        modelBuilder.Entity<PlanPosition>().HasData(
            new PlanPosition { Id = 1, DocumentNumber = "ПП-2024-001", DocumentDate = new DateTime(2024, 1, 10), PlanningPeriod = "1 квартал 2024", PositionCode = "ПП-2024-001", Name = "Производство корпусов Q1", ProductItemId = 1, QuantityPlanned = 25 },
            new PlanPosition { Id = 2, DocumentNumber = "ПП-2024-002", DocumentDate = new DateTime(2024, 1, 10), PlanningPeriod = "1 квартал 2024", PositionCode = "ПП-2024-002", Name = "Производство валов Q1", ProductItemId = 2, QuantityPlanned = 15 },
            new PlanPosition { Id = 3, DocumentNumber = "ПП-2024-003", DocumentDate = new DateTime(2024, 1, 10), PlanningPeriod = "1 квартал 2024", PositionCode = "ПП-2024-003", Name = "Производство шестерен Q1", ProductItemId = 3, QuantityPlanned = 50 }
        );

        // Seed test data for RoutingSheets
        modelBuilder.Entity<RoutingSheet>().HasData(
            new RoutingSheet 
            { 
                Id = 1, 
                Number = "МЛ-2024-0001", 
                Name = "Маршрутный лист на корпус редуктора", 
                PlanPositionId = 1, 
                ProductItemId = 1, 
                UnitId = 1, 
                StatusId = 2, // Активен
                Quantity = 10,
                CreatedAt = new DateTime(2024, 1, 15, 10, 0, 0, DateTimeKind.Utc)
            },
            new RoutingSheet 
            { 
                Id = 2, 
                Number = "МЛ-2024-0002", 
                Name = "Маршрутный лист на вал приводной", 
                PlanPositionId = 2, 
                ProductItemId = 2, 
                UnitId = 1, 
                StatusId = 1, // Черновик
                Quantity = 5,
                CreatedAt = new DateTime(2024, 1, 20, 14, 30, 0, DateTimeKind.Utc)
            }
        );

        // Seed test data for Operations
        modelBuilder.Entity<Operation>().HasData(
            // Операции для МЛ-2024-0001
            new Operation 
            { 
                Id = 1, 
                RoutingSheetId = 1, 
                SeqNumber = 1, 
                Code = "ОП-001", 
                Name = "Заготовительная операция", 
                StatusId = 3, // Завершена
                GuildId = 2, 
                OperationTypeId = 3, 
                PerformerId = 3,
                Price = 150.00m,
                Sum = 1500.00m,
                Quantity = 10
            },
            new Operation 
            { 
                Id = 2, 
                RoutingSheetId = 1, 
                SeqNumber = 2, 
                Code = "ОП-002", 
                Name = "Фрезерование пазов", 
                StatusId = 2, // В работе
                GuildId = 2, 
                OperationTypeId = 4, 
                PerformerId = 3,
                Price = 250.00m,
                Sum = 2500.00m,
                Quantity = 10
            },
            new Operation 
            { 
                Id = 3, 
                RoutingSheetId = 1, 
                SeqNumber = 3, 
                Code = "ОП-003", 
                Name = "Сборка узла", 
                StatusId = 1, // Ожидает
                GuildId = 1, 
                OperationTypeId = 1, 
                PerformerId = 1,
                Price = 200.00m,
                Sum = 2000.00m,
                Quantity = 10
            },
            new Operation 
            { 
                Id = 4, 
                RoutingSheetId = 1, 
                SeqNumber = 4, 
                Code = "ОП-004", 
                Name = "Контроль ОТК", 
                StatusId = 1, // Ожидает
                GuildId = 1, 
                OperationTypeId = 5, 
                PerformerId = null,
                Price = 50.00m,
                Sum = 500.00m,
                Quantity = 10
            },
            // Операции для МЛ-2024-0002
            new Operation 
            { 
                Id = 5, 
                RoutingSheetId = 2, 
                SeqNumber = 1, 
                Code = "ОП-001", 
                Name = "Токарная обработка", 
                StatusId = 1, // Ожидает
                GuildId = 2, 
                OperationTypeId = 3, 
                PerformerId = null,
                Price = 300.00m,
                Sum = 1500.00m,
                Quantity = 5
            },
            new Operation 
            { 
                Id = 6, 
                RoutingSheetId = 2, 
                SeqNumber = 2, 
                Code = "ОП-002", 
                Name = "Сварка фланца", 
                StatusId = 1, // Ожидает
                GuildId = 3, 
                OperationTypeId = 2, 
                PerformerId = 2,
                Price = 180.00m,
                Sum = 900.00m,
                Quantity = 5
            }
        );

        // User configuration
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        // Indexes
        modelBuilder.Entity<RoutingSheet>()
            .HasIndex(rs => rs.Number)
            .IsUnique();

        modelBuilder.Entity<PlanPosition>()
            .HasIndex(pp => pp.PositionCode);

        modelBuilder.Entity<Operation>()
            .HasIndex(o => new { o.RoutingSheetId, o.SeqNumber });
    }
}

