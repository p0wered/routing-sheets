using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using RoutingSheetsNew.Data;

#nullable disable

namespace RoutingSheetsNew.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260403130000_InitialCreate")]
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Guilds",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false)
                },
                constraints: table => { table.PrimaryKey("PK_Guilds", x => x.Id); });

            migrationBuilder.CreateTable(
                name: "OperationStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Code = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false)
                },
                constraints: table => { table.PrimaryKey("PK_OperationStatuses", x => x.Id); });

            migrationBuilder.CreateTable(
                name: "Parts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true)
                },
                constraints: table => { table.PrimaryKey("PK_Parts", x => x.Id); });

            migrationBuilder.CreateTable(
                name: "Performers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    full_name = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    Role = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true)
                },
                constraints: table => { table.PrimaryKey("PK_Performers", x => x.Id); });

            migrationBuilder.CreateTable(
                name: "PlanStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Code = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false)
                },
                constraints: table => { table.PrimaryKey("PK_PlanStatuses", x => x.Id); });

            migrationBuilder.CreateTable(
                name: "ProductItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true)
                },
                constraints: table => { table.PrimaryKey("PK_ProductItems", x => x.Id); });

            migrationBuilder.CreateTable(
                name: "RoutingSheetStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Code = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false)
                },
                constraints: table => { table.PrimaryKey("PK_RoutingSheetStatuses", x => x.Id); });

            migrationBuilder.CreateTable(
                name: "Units",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false)
                },
                constraints: table => { table.PrimaryKey("PK_Units", x => x.Id); });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Username = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "TEXT", nullable: false),
                    FullName = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    Role = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    guild_id = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_Guilds_guild_id",
                        column: x => x.guild_id,
                        principalTable: "Guilds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PartOperations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    part_id = table.Column<int>(type: "INTEGER", nullable: false),
                    seq_number = table.Column<int>(type: "INTEGER", nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    Code = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartOperations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PartOperations_Parts_part_id",
                        column: x => x.part_id,
                        principalTable: "Parts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlanPositions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    document_number = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    document_date = table.Column<DateTime>(type: "date", nullable: false),
                    plan_month = table.Column<int>(type: "INTEGER", nullable: false),
                    plan_year = table.Column<int>(type: "INTEGER", nullable: false),
                    position_code = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    product_item_id = table.Column<int>(type: "INTEGER", nullable: false),
                    quantity_planned = table.Column<int>(type: "INTEGER", nullable: false),
                    guild_id = table.Column<int>(type: "INTEGER", nullable: false),
                    status_id = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanPositions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlanPositions_Guilds_guild_id",
                        column: x => x.guild_id,
                        principalTable: "Guilds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlanPositions_PlanStatuses_status_id",
                        column: x => x.status_id,
                        principalTable: "PlanStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PlanPositions_ProductItems_product_item_id",
                        column: x => x.product_item_id,
                        principalTable: "ProductItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProductParts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    product_item_id = table.Column<int>(type: "INTEGER", nullable: false),
                    part_id = table.Column<int>(type: "INTEGER", nullable: false),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductParts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductParts_Parts_part_id",
                        column: x => x.part_id,
                        principalTable: "Parts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductParts_ProductItems_product_item_id",
                        column: x => x.product_item_id,
                        principalTable: "ProductItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RoutingSheets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Number = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    plan_position_id = table.Column<int>(type: "INTEGER", nullable: true),
                    part_id = table.Column<int>(type: "INTEGER", nullable: true),
                    unit_id = table.Column<int>(type: "INTEGER", nullable: true),
                    status_id = table.Column<int>(type: "INTEGER", nullable: false),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoutingSheets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoutingSheets_Parts_part_id",
                        column: x => x.part_id,
                        principalTable: "Parts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RoutingSheets_PlanPositions_plan_position_id",
                        column: x => x.plan_position_id,
                        principalTable: "PlanPositions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RoutingSheets_RoutingSheetStatuses_status_id",
                        column: x => x.status_id,
                        principalTable: "RoutingSheetStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RoutingSheets_Units_unit_id",
                        column: x => x.unit_id,
                        principalTable: "Units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Operations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    routing_sheet_id = table.Column<int>(type: "INTEGER", nullable: false),
                    seq_number = table.Column<int>(type: "INTEGER", nullable: false),
                    Code = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    status_id = table.Column<int>(type: "INTEGER", nullable: true),
                    performer_id = table.Column<int>(type: "INTEGER", nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Operations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Operations_OperationStatuses_status_id",
                        column: x => x.status_id,
                        principalTable: "OperationStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Operations_Performers_performer_id",
                        column: x => x.performer_id,
                        principalTable: "Performers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Operations_RoutingSheets_routing_sheet_id",
                        column: x => x.routing_sheet_id,
                        principalTable: "RoutingSheets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(name: "IX_Operations_performer_id", table: "Operations", column: "performer_id");
            migrationBuilder.CreateIndex(name: "IX_Operations_routing_sheet_id_seq_number", table: "Operations", columns: new[] { "routing_sheet_id", "seq_number" });
            migrationBuilder.CreateIndex(name: "IX_Operations_status_id", table: "Operations", column: "status_id");
            migrationBuilder.CreateIndex(name: "IX_PartOperations_part_id_seq_number", table: "PartOperations", columns: new[] { "part_id", "seq_number" });
            migrationBuilder.CreateIndex(name: "IX_PlanPositions_guild_id_plan_year_plan_month", table: "PlanPositions", columns: new[] { "guild_id", "plan_year", "plan_month" });
            migrationBuilder.CreateIndex(name: "IX_PlanPositions_position_code", table: "PlanPositions", column: "position_code");
            migrationBuilder.CreateIndex(name: "IX_PlanPositions_product_item_id", table: "PlanPositions", column: "product_item_id");
            migrationBuilder.CreateIndex(name: "IX_PlanPositions_status_id", table: "PlanPositions", column: "status_id");
            migrationBuilder.CreateIndex(name: "IX_ProductParts_part_id", table: "ProductParts", column: "part_id");
            migrationBuilder.CreateIndex(name: "IX_ProductParts_product_item_id_part_id", table: "ProductParts", columns: new[] { "product_item_id", "part_id" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_RoutingSheets_Number", table: "RoutingSheets", column: "Number", unique: true);
            migrationBuilder.CreateIndex(name: "IX_RoutingSheets_part_id", table: "RoutingSheets", column: "part_id");
            migrationBuilder.CreateIndex(name: "IX_RoutingSheets_plan_position_id_part_id", table: "RoutingSheets", columns: new[] { "plan_position_id", "part_id" }, unique: true);
            migrationBuilder.CreateIndex(name: "IX_RoutingSheets_status_id", table: "RoutingSheets", column: "status_id");
            migrationBuilder.CreateIndex(name: "IX_RoutingSheets_unit_id", table: "RoutingSheets", column: "unit_id");
            migrationBuilder.CreateIndex(name: "IX_Users_guild_id", table: "Users", column: "guild_id");
            migrationBuilder.CreateIndex(name: "IX_Users_Username", table: "Users", column: "Username", unique: true);

            migrationBuilder.InsertData(
                table: "RoutingSheetStatuses",
                columns: new[] { "Id", "Code", "Name" },
                columnTypes: new[] { "INTEGER", "TEXT", "TEXT" },
                values: new object[,]
                {
                    { 1, "DRAFT", "Черновик" },
                    { 2, "ACTIVE", "Активен" },
                    { 3, "COMPLETED", "Завершен" },
                    { 4, "CANCELLED", "Отменен" }
                });

            migrationBuilder.InsertData(
                table: "OperationStatuses",
                columns: new[] { "Id", "Code", "Name" },
                columnTypes: new[] { "INTEGER", "TEXT", "TEXT" },
                values: new object[,]
                {
                    { 1, "PENDING", "Ожидает" },
                    { 2, "IN_PROGRESS", "В работе" },
                    { 3, "COMPLETED", "Завершена" },
                    { 4, "CANCELLED", "Отменена" }
                });

            migrationBuilder.InsertData(
                table: "PlanStatuses",
                columns: new[] { "Id", "Code", "Name" },
                columnTypes: new[] { "INTEGER", "TEXT", "TEXT" },
                values: new object[,]
                {
                    { 1, "OPEN", "Открыт" },
                    { 2, "CLOSED", "Закрыт" }
                });

            migrationBuilder.InsertData(
                table: "Units",
                columns: new[] { "Id", "Name" },
                columnTypes: new[] { "INTEGER", "TEXT" },
                values: new object[,]
                {
                    { 1, "шт." },
                    { 2, "кг" },
                    { 3, "м" }
                });

            migrationBuilder.InsertData(
                table: "Guilds",
                columns: new[] { "Id", "Name" },
                columnTypes: new[] { "INTEGER", "TEXT" },
                values: new object[,]
                {
                    { 1, "Сборочный цех №1" },
                    { 2, "Механический цех №2" },
                    { 3, "Сварочный цех №3" }
                });

            migrationBuilder.InsertData(
                table: "Performers",
                columns: new[] { "Id", "full_name", "Role" },
                columnTypes: new[] { "INTEGER", "TEXT", "TEXT" },
                values: new object[,]
                {
                    { 1, "Иванов Иван Иванович", "Слесарь-сборщик" },
                    { 2, "Петров Петр Петрович", "Сварщик" },
                    { 3, "Сидоров Сидор Сидорович", "Токарь" }
                });

            migrationBuilder.InsertData(
                table: "ProductItems",
                columns: new[] { "Id", "Name", "Description" },
                columnTypes: new[] { "INTEGER", "TEXT", "TEXT" },
                values: new object[,]
                {
                    { 1, "Корпус редуктора", "Корпус для промышленного редуктора РМ-500" },
                    { 2, "Вал приводной", "Приводной вал для станка" },
                    { 3, "Шестерня ведущая", "Ведущая шестерня z=24" }
                });

            migrationBuilder.InsertData(
                table: "Parts",
                columns: new[] { "Id", "Name", "Description" },
                columnTypes: new[] { "INTEGER", "TEXT", "TEXT" },
                values: new object[,]
                {
                    { 1, "Корпус", "Основной корпус изделия" },
                    { 2, "Крышка", "Крышка корпуса" },
                    { 3, "Вал", "Приводной вал" },
                    { 4, "Шестерня", "Ведущая шестерня" },
                    { 5, "Подшипник", "Опорный подшипник" },
                    { 6, "Болт М6", "Крепёжный болт М6" }
                });

            migrationBuilder.InsertData(
                table: "PartOperations",
                columns: new[] { "Id", "part_id", "seq_number", "Name", "Code", "Price" },
                columnTypes: new[] { "INTEGER", "INTEGER", "INTEGER", "TEXT", "TEXT", "decimal(18,2)" },
                values: new object[,]
                {
                    { 1, 1, 1, "Фрезеровка корпуса", "ПО-001", 300.00m },
                    { 2, 1, 2, "Контроль корпуса", "ПО-002", 50.00m },
                    { 3, 2, 1, "Штамповка заготовки крышки", "ПО-003", 30.00m },
                    { 4, 2, 2, "Шлифовка крышки", "ПО-004", 20.00m },
                    { 5, 3, 1, "Токарная обработка вала", "ПО-005", 250.00m },
                    { 6, 4, 1, "Фрезеровка шестерни", "ПО-006", 180.00m },
                    { 7, 4, 2, "Термообработка шестерни", "ПО-007", 100.00m },
                    { 8, 5, 1, "Контроль подшипника", "ПО-008", 20.00m },
                    { 9, 6, 1, "Токарная обработка болта", "ПО-009", 10.00m }
                });

            migrationBuilder.InsertData(
                table: "ProductParts",
                columns: new[] { "Id", "product_item_id", "part_id", "Quantity" },
                columnTypes: new[] { "INTEGER", "INTEGER", "INTEGER", "INTEGER" },
                values: new object[,]
                {
                    { 1, 1, 1, 1 },
                    { 2, 1, 2, 2 },
                    { 3, 1, 6, 8 },
                    { 4, 2, 3, 1 },
                    { 5, 2, 5, 2 },
                    { 6, 3, 4, 1 }
                });

            migrationBuilder.InsertData(
                table: "PlanPositions",
                columns: new[] { "Id", "document_number", "document_date", "plan_month", "plan_year", "position_code", "Name", "product_item_id", "quantity_planned", "guild_id", "status_id" },
                columnTypes: new[] { "INTEGER", "TEXT", "date", "INTEGER", "INTEGER", "TEXT", "TEXT", "INTEGER", "INTEGER", "INTEGER", "INTEGER" },
                values: new object[,]
                {
                    { 1, "ПП-2026-001", new DateTime(2026, 1, 10), 1, 2026, "ПП-2026-001", "Производство корпусов, январь", 1, 25, 1, 1 },
                    { 2, "ПП-2026-002", new DateTime(2026, 1, 10), 1, 2026, "ПП-2026-002", "Производство валов, январь", 2, 15, 2, 1 },
                    { 3, "ПП-2026-003", new DateTime(2026, 1, 10), 1, 2026, "ПП-2026-003", "Производство шестерен, январь", 3, 50, 2, 1 },
                    { 4, "ПП-2026-004", new DateTime(2026, 2, 5), 2, 2026, "ПП-2026-004", "Производство корпусов, февраль", 1, 30, 1, 1 },
                    { 5, "ПП-2026-005", new DateTime(2026, 2, 5), 2, 2026, "ПП-2026-005", "Производство валов, февраль", 2, 20, 2, 1 },
                    { 6, "ПП-2026-006", new DateTime(2026, 2, 5), 2, 2026, "ПП-2026-006", "Производство шестерен, февраль", 3, 40, 2, 1 },
                    { 7, "ПП-2026-007", new DateTime(2026, 2, 5), 2, 2026, "ПП-2026-007", "Производство корпусов (доп.), февраль", 1, 10, 1, 1 }
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Operations");
            migrationBuilder.DropTable(name: "PartOperations");
            migrationBuilder.DropTable(name: "ProductParts");
            migrationBuilder.DropTable(name: "Users");
            migrationBuilder.DropTable(name: "OperationStatuses");
            migrationBuilder.DropTable(name: "Performers");
            migrationBuilder.DropTable(name: "RoutingSheets");
            migrationBuilder.DropTable(name: "Guilds");
            migrationBuilder.DropTable(name: "Parts");
            migrationBuilder.DropTable(name: "PlanPositions");
            migrationBuilder.DropTable(name: "RoutingSheetStatuses");
            migrationBuilder.DropTable(name: "Units");
            migrationBuilder.DropTable(name: "PlanStatuses");
            migrationBuilder.DropTable(name: "ProductItems");
        }
    }
}
