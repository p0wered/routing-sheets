using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace RoutingSheetsNew.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
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
                constraints: table =>
                {
                    table.PrimaryKey("PK_Guilds", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OperationStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Code = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperationStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OperationTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperationTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Parts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Parts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Performers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    full_name = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    Role = table.Column<string>(type: "TEXT", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Performers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlanStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Code = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RoutingSheetStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Code = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoutingSheetStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Units",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Units", x => x.Id);
                });

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
                    operation_type_id = table.Column<int>(type: "INTEGER", nullable: true),
                    guild_id = table.Column<int>(type: "INTEGER", nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartOperations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PartOperations_Guilds_guild_id",
                        column: x => x.guild_id,
                        principalTable: "Guilds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PartOperations_OperationTypes_operation_type_id",
                        column: x => x.operation_type_id,
                        principalTable: "OperationTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
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
                    product_item_id = table.Column<int>(type: "INTEGER", nullable: true),
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
                        name: "FK_RoutingSheets_PlanPositions_plan_position_id",
                        column: x => x.plan_position_id,
                        principalTable: "PlanPositions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RoutingSheets_ProductItems_product_item_id",
                        column: x => x.product_item_id,
                        principalTable: "ProductItems",
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
                    guild_id = table.Column<int>(type: "INTEGER", nullable: true),
                    operation_type_id = table.Column<int>(type: "INTEGER", nullable: true),
                    performer_id = table.Column<int>(type: "INTEGER", nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Sum = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Quantity = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Operations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Operations_Guilds_guild_id",
                        column: x => x.guild_id,
                        principalTable: "Guilds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Operations_OperationStatuses_status_id",
                        column: x => x.status_id,
                        principalTable: "OperationStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Operations_OperationTypes_operation_type_id",
                        column: x => x.operation_type_id,
                        principalTable: "OperationTypes",
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

            migrationBuilder.InsertData(
                table: "Guilds",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Сборочный цех №1" },
                    { 2, "Механический цех №2" },
                    { 3, "Сварочный цех №3" }
                });

            migrationBuilder.InsertData(
                table: "OperationStatuses",
                columns: new[] { "Id", "Code", "Name" },
                values: new object[,]
                {
                    { 1, "PENDING", "Ожидает" },
                    { 2, "IN_PROGRESS", "В работе" },
                    { 3, "COMPLETED", "Завершена" },
                    { 4, "CANCELLED", "Отменена" }
                });

            migrationBuilder.InsertData(
                table: "OperationTypes",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Сборка" },
                    { 2, "Сварка" },
                    { 3, "Токарная обработка" },
                    { 4, "Фрезерная обработка" },
                    { 5, "Контроль качества" }
                });

            migrationBuilder.InsertData(
                table: "Parts",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { 1, "Основной корпус изделия", "Корпус" },
                    { 2, "Крышка корпуса", "Крышка" },
                    { 3, "Приводной вал", "Вал" },
                    { 4, "Ведущая шестерня", "Шестерня" },
                    { 5, "Опорный подшипник", "Подшипник" },
                    { 6, "Крепёжный болт М6", "Болт М6" }
                });

            migrationBuilder.InsertData(
                table: "Performers",
                columns: new[] { "Id", "full_name", "Role" },
                values: new object[,]
                {
                    { 1, "Иванов Иван Иванович", "Слесарь-сборщик" },
                    { 2, "Петров Петр Петрович", "Сварщик" },
                    { 3, "Сидоров Сидор Сидорович", "Токарь" }
                });

            migrationBuilder.InsertData(
                table: "PlanStatuses",
                columns: new[] { "Id", "Code", "Name" },
                values: new object[,]
                {
                    { 1, "OPEN", "Открыт" },
                    { 2, "CLOSED", "Закрыт" }
                });

            migrationBuilder.InsertData(
                table: "ProductItems",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { 1, "Корпус для промышленного редуктора РМ-500", "Корпус редуктора" },
                    { 2, "Приводной вал для станка", "Вал приводной" },
                    { 3, "Ведущая шестерня z=24", "Шестерня ведущая" }
                });

            migrationBuilder.InsertData(
                table: "RoutingSheetStatuses",
                columns: new[] { "Id", "Code", "Name" },
                values: new object[,]
                {
                    { 1, "DRAFT", "Черновик" },
                    { 2, "ACTIVE", "Активен" },
                    { 3, "COMPLETED", "Завершен" },
                    { 4, "CANCELLED", "Отменен" }
                });

            migrationBuilder.InsertData(
                table: "Units",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "шт." },
                    { 2, "кг" },
                    { 3, "м" }
                });

            migrationBuilder.InsertData(
                table: "PartOperations",
                columns: new[] { "Id", "Code", "guild_id", "Name", "operation_type_id", "part_id", "Price", "seq_number" },
                values: new object[,]
                {
                    { 1, "ПО-001", 2, "Фрезеровка корпуса", 4, 1, 300.00m, 1 },
                    { 2, "ПО-002", 2, "Контроль корпуса", 5, 1, 50.00m, 2 },
                    { 3, "ПО-003", 1, "Штамповка заготовки крышки", 1, 2, 30.00m, 1 },
                    { 4, "ПО-004", 2, "Шлифовка крышки", 4, 2, 20.00m, 2 },
                    { 5, "ПО-005", 2, "Токарная обработка вала", 3, 3, 250.00m, 1 },
                    { 6, "ПО-006", 2, "Фрезеровка шестерни", 4, 4, 180.00m, 1 },
                    { 7, "ПО-007", 3, "Термообработка шестерни", 2, 4, 100.00m, 2 },
                    { 8, "ПО-008", 1, "Контроль подшипника", 5, 5, 20.00m, 1 },
                    { 9, "ПО-009", 2, "Токарная обработка болта", 3, 6, 10.00m, 1 }
                });

            migrationBuilder.InsertData(
                table: "PlanPositions",
                columns: new[] { "Id", "document_date", "document_number", "guild_id", "Name", "plan_month", "plan_year", "position_code", "product_item_id", "quantity_planned", "status_id" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "ПП-2026-001", 1, "Производство корпусов, январь", 1, 2026, "ПП-2026-001", 1, 25, 1 },
                    { 2, new DateTime(2026, 1, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "ПП-2026-002", 2, "Производство валов, январь", 1, 2026, "ПП-2026-002", 2, 15, 1 },
                    { 3, new DateTime(2026, 1, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "ПП-2026-003", 2, "Производство шестерен, январь", 1, 2026, "ПП-2026-003", 3, 50, 1 },
                    { 4, new DateTime(2026, 2, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), "ПП-2026-004", 1, "Производство корпусов, февраль", 2, 2026, "ПП-2026-004", 1, 30, 1 },
                    { 5, new DateTime(2026, 2, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), "ПП-2026-005", 2, "Производство валов, февраль", 2, 2026, "ПП-2026-005", 2, 20, 1 },
                    { 6, new DateTime(2026, 2, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), "ПП-2026-006", 2, "Производство шестерен, февраль", 2, 2026, "ПП-2026-006", 3, 40, 1 },
                    { 7, new DateTime(2026, 2, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), "ПП-2026-007", 1, "Производство корпусов (доп.), февраль", 2, 2026, "ПП-2026-007", 1, 10, 1 }
                });

            migrationBuilder.InsertData(
                table: "ProductParts",
                columns: new[] { "Id", "part_id", "product_item_id", "Quantity" },
                values: new object[,]
                {
                    { 1, 1, 1, 1 },
                    { 2, 2, 1, 2 },
                    { 3, 6, 1, 8 },
                    { 4, 3, 2, 1 },
                    { 5, 5, 2, 2 },
                    { 6, 4, 3, 1 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Operations_guild_id",
                table: "Operations",
                column: "guild_id");

            migrationBuilder.CreateIndex(
                name: "IX_Operations_operation_type_id",
                table: "Operations",
                column: "operation_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_Operations_performer_id",
                table: "Operations",
                column: "performer_id");

            migrationBuilder.CreateIndex(
                name: "IX_Operations_routing_sheet_id_seq_number",
                table: "Operations",
                columns: new[] { "routing_sheet_id", "seq_number" });

            migrationBuilder.CreateIndex(
                name: "IX_Operations_status_id",
                table: "Operations",
                column: "status_id");

            migrationBuilder.CreateIndex(
                name: "IX_PartOperations_guild_id",
                table: "PartOperations",
                column: "guild_id");

            migrationBuilder.CreateIndex(
                name: "IX_PartOperations_operation_type_id",
                table: "PartOperations",
                column: "operation_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_PartOperations_part_id_seq_number",
                table: "PartOperations",
                columns: new[] { "part_id", "seq_number" });

            migrationBuilder.CreateIndex(
                name: "IX_PlanPositions_guild_id_plan_year_plan_month",
                table: "PlanPositions",
                columns: new[] { "guild_id", "plan_year", "plan_month" });

            migrationBuilder.CreateIndex(
                name: "IX_PlanPositions_position_code",
                table: "PlanPositions",
                column: "position_code");

            migrationBuilder.CreateIndex(
                name: "IX_PlanPositions_product_item_id",
                table: "PlanPositions",
                column: "product_item_id");

            migrationBuilder.CreateIndex(
                name: "IX_PlanPositions_status_id",
                table: "PlanPositions",
                column: "status_id");

            migrationBuilder.CreateIndex(
                name: "IX_ProductParts_part_id",
                table: "ProductParts",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "IX_ProductParts_product_item_id_part_id",
                table: "ProductParts",
                columns: new[] { "product_item_id", "part_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RoutingSheets_Number",
                table: "RoutingSheets",
                column: "Number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RoutingSheets_plan_position_id",
                table: "RoutingSheets",
                column: "plan_position_id");

            migrationBuilder.CreateIndex(
                name: "IX_RoutingSheets_product_item_id",
                table: "RoutingSheets",
                column: "product_item_id");

            migrationBuilder.CreateIndex(
                name: "IX_RoutingSheets_status_id",
                table: "RoutingSheets",
                column: "status_id");

            migrationBuilder.CreateIndex(
                name: "IX_RoutingSheets_unit_id",
                table: "RoutingSheets",
                column: "unit_id");

            migrationBuilder.CreateIndex(
                name: "IX_Users_guild_id",
                table: "Users",
                column: "guild_id");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Operations");

            migrationBuilder.DropTable(
                name: "PartOperations");

            migrationBuilder.DropTable(
                name: "ProductParts");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "OperationStatuses");

            migrationBuilder.DropTable(
                name: "Performers");

            migrationBuilder.DropTable(
                name: "RoutingSheets");

            migrationBuilder.DropTable(
                name: "OperationTypes");

            migrationBuilder.DropTable(
                name: "Parts");

            migrationBuilder.DropTable(
                name: "PlanPositions");

            migrationBuilder.DropTable(
                name: "RoutingSheetStatuses");

            migrationBuilder.DropTable(
                name: "Units");

            migrationBuilder.DropTable(
                name: "Guilds");

            migrationBuilder.DropTable(
                name: "PlanStatuses");

            migrationBuilder.DropTable(
                name: "ProductItems");
        }
    }
}
