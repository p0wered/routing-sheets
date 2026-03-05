using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace RoutingSheetsNew.Migrations
{
    /// <inheritdoc />
    public partial class SeedTestData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                table: "Performers",
                columns: new[] { "Id", "full_name", "Role" },
                values: new object[,]
                {
                    { 1, "Иванов Иван Иванович", "Слесарь-сборщик" },
                    { 2, "Петров Петр Петрович", "Сварщик" },
                    { 3, "Сидоров Сидор Сидорович", "Токарь" }
                });

            migrationBuilder.InsertData(
                table: "ProductItems",
                columns: new[] { "Id", "Description", "Name", "quantity_planned" },
                values: new object[,]
                {
                    { 1, "Корпус для промышленного редуктора РМ-500", "Корпус редуктора", 100 },
                    { 2, "Приводной вал для станка", "Вал приводной", 50 },
                    { 3, "Ведущая шестерня z=24", "Шестерня ведущая", 200 }
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
                table: "PlanPositions",
                columns: new[] { "Id", "Name", "position_code", "product_item_id", "quantity_planned" },
                values: new object[,]
                {
                    { 1, "Производство корпусов Q1", "ПП-2024-001", 1, 25 },
                    { 2, "Производство валов Q1", "ПП-2024-002", 2, 15 },
                    { 3, "Производство шестерен Q1", "ПП-2024-003", 3, 50 }
                });

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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
                table: "PlanPositions",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Guilds",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Guilds",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Guilds",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "OperationTypes",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "OperationTypes",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "OperationTypes",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "OperationTypes",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "OperationTypes",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Performers",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Performers",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Performers",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "ProductItems",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "RoutingSheets",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "RoutingSheets",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "PlanPositions",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "PlanPositions",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "ProductItems",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "ProductItems",
                keyColumn: "Id",
                keyValue: 2);
        }
    }
}
