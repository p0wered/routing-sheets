using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace RoutingSheetsNew.Migrations
{
    /// <inheritdoc />
    public partial class Phase2_RestructureModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Operations",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Operations",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Operations",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Operations",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Operations",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Operations",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "RoutingSheets",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "RoutingSheets",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DropColumn(
                name: "quantity_planned",
                table: "ProductItems");

            migrationBuilder.DropColumn(
                name: "planning_period",
                table: "PlanPositions");

            migrationBuilder.AddColumn<int>(
                name: "guild_id",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "guild_id",
                table: "PlanPositions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "plan_month",
                table: "PlanPositions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "plan_year",
                table: "PlanPositions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "status_id",
                table: "PlanPositions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Parts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Parts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlanStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PartOperations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    part_id = table.Column<int>(type: "int", nullable: false),
                    seq_number = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    operation_type_id = table.Column<int>(type: "int", nullable: true),
                    guild_id = table.Column<int>(type: "int", nullable: true),
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
                name: "ProductParts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    product_item_id = table.Column<int>(type: "int", nullable: false),
                    part_id = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false)
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

            migrationBuilder.UpdateData(
                table: "PlanPositions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "document_date", "document_number", "guild_id", "Name", "plan_month", "plan_year", "position_code", "status_id" },
                values: new object[] { new DateTime(2026, 1, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "ПП-2026-001", 1, "Производство корпусов, январь", 1, 2026, "ПП-2026-001", 1 });

            migrationBuilder.UpdateData(
                table: "PlanPositions",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "document_date", "document_number", "guild_id", "Name", "plan_month", "plan_year", "position_code", "status_id" },
                values: new object[] { new DateTime(2026, 1, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "ПП-2026-002", 2, "Производство валов, январь", 1, 2026, "ПП-2026-002", 1 });

            migrationBuilder.UpdateData(
                table: "PlanPositions",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "document_date", "document_number", "guild_id", "Name", "plan_month", "plan_year", "position_code", "status_id" },
                values: new object[] { new DateTime(2026, 1, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "ПП-2026-003", 2, "Производство шестерен, январь", 1, 2026, "ПП-2026-003", 1 });

            migrationBuilder.InsertData(
                table: "PlanStatuses",
                columns: new[] { "Id", "Code", "Name" },
                values: new object[,]
                {
                    { 1, "OPEN", "Открыт" },
                    { 2, "CLOSED", "Закрыт" }
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
                name: "IX_Users_guild_id",
                table: "Users",
                column: "guild_id");

            migrationBuilder.CreateIndex(
                name: "IX_PlanPositions_guild_id_plan_year_plan_month",
                table: "PlanPositions",
                columns: new[] { "guild_id", "plan_year", "plan_month" });

            migrationBuilder.CreateIndex(
                name: "IX_PlanPositions_status_id",
                table: "PlanPositions",
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
                name: "IX_ProductParts_part_id",
                table: "ProductParts",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "IX_ProductParts_product_item_id_part_id",
                table: "ProductParts",
                columns: new[] { "product_item_id", "part_id" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_PlanPositions_Guilds_guild_id",
                table: "PlanPositions",
                column: "guild_id",
                principalTable: "Guilds",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PlanPositions_PlanStatuses_status_id",
                table: "PlanPositions",
                column: "status_id",
                principalTable: "PlanStatuses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Guilds_guild_id",
                table: "Users",
                column: "guild_id",
                principalTable: "Guilds",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PlanPositions_Guilds_guild_id",
                table: "PlanPositions");

            migrationBuilder.DropForeignKey(
                name: "FK_PlanPositions_PlanStatuses_status_id",
                table: "PlanPositions");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Guilds_guild_id",
                table: "Users");

            migrationBuilder.DropTable(
                name: "PartOperations");

            migrationBuilder.DropTable(
                name: "PlanStatuses");

            migrationBuilder.DropTable(
                name: "ProductParts");

            migrationBuilder.DropTable(
                name: "Parts");

            migrationBuilder.DropIndex(
                name: "IX_Users_guild_id",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_PlanPositions_guild_id_plan_year_plan_month",
                table: "PlanPositions");

            migrationBuilder.DropIndex(
                name: "IX_PlanPositions_status_id",
                table: "PlanPositions");

            migrationBuilder.DeleteData(
                table: "PlanPositions",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "PlanPositions",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "PlanPositions",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "PlanPositions",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DropColumn(
                name: "guild_id",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "guild_id",
                table: "PlanPositions");

            migrationBuilder.DropColumn(
                name: "plan_month",
                table: "PlanPositions");

            migrationBuilder.DropColumn(
                name: "plan_year",
                table: "PlanPositions");

            migrationBuilder.DropColumn(
                name: "status_id",
                table: "PlanPositions");

            migrationBuilder.AddColumn<int>(
                name: "quantity_planned",
                table: "ProductItems",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "planning_period",
                table: "PlanPositions",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "PlanPositions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "document_date", "document_number", "Name", "planning_period", "position_code" },
                values: new object[] { new DateTime(2024, 1, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "ПП-2024-001", "Производство корпусов Q1", "1 квартал 2024", "ПП-2024-001" });

            migrationBuilder.UpdateData(
                table: "PlanPositions",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "document_date", "document_number", "Name", "planning_period", "position_code" },
                values: new object[] { new DateTime(2024, 1, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "ПП-2024-002", "Производство валов Q1", "1 квартал 2024", "ПП-2024-002" });

            migrationBuilder.UpdateData(
                table: "PlanPositions",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "document_date", "document_number", "Name", "planning_period", "position_code" },
                values: new object[] { new DateTime(2024, 1, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "ПП-2024-003", "Производство шестерен Q1", "1 квартал 2024", "ПП-2024-003" });

            migrationBuilder.UpdateData(
                table: "ProductItems",
                keyColumn: "Id",
                keyValue: 1,
                column: "quantity_planned",
                value: 100);

            migrationBuilder.UpdateData(
                table: "ProductItems",
                keyColumn: "Id",
                keyValue: 2,
                column: "quantity_planned",
                value: 50);

            migrationBuilder.UpdateData(
                table: "ProductItems",
                keyColumn: "Id",
                keyValue: 3,
                column: "quantity_planned",
                value: 200);

            migrationBuilder.InsertData(
                table: "RoutingSheets",
                columns: new[] { "Id", "CreatedAt", "Name", "Number", "plan_position_id", "product_item_id", "Quantity", "status_id", "unit_id", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2024, 1, 15, 10, 0, 0, 0, DateTimeKind.Utc), "Маршрутный лист на корпус редуктора", "МЛ-2024-0001", 1, 1, 10, 2, 1, null },
                    { 2, new DateTime(2024, 1, 20, 14, 30, 0, 0, DateTimeKind.Utc), "Маршрутный лист на вал приводной", "МЛ-2024-0002", 2, 2, 5, 1, 1, null }
                });

            migrationBuilder.InsertData(
                table: "Operations",
                columns: new[] { "Id", "Code", "guild_id", "Name", "operation_type_id", "performer_id", "Price", "Quantity", "routing_sheet_id", "seq_number", "status_id", "Sum" },
                values: new object[,]
                {
                    { 1, "ОП-001", 2, "Заготовительная операция", 3, 3, 150.00m, 10, 1, 1, 3, 1500.00m },
                    { 2, "ОП-002", 2, "Фрезерование пазов", 4, 3, 250.00m, 10, 1, 2, 2, 2500.00m },
                    { 3, "ОП-003", 1, "Сборка узла", 1, 1, 200.00m, 10, 1, 3, 1, 2000.00m },
                    { 4, "ОП-004", 1, "Контроль ОТК", 5, null, 50.00m, 10, 1, 4, 1, 500.00m },
                    { 5, "ОП-001", 2, "Токарная обработка", 3, null, 300.00m, 5, 2, 1, 1, 1500.00m },
                    { 6, "ОП-002", 3, "Сварка фланца", 2, 2, 180.00m, 5, 2, 2, 1, 900.00m }
                });
        }
    }
}
