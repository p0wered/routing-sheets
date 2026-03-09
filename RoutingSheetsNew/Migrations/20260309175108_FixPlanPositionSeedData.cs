using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RoutingSheetsNew.Migrations
{
    /// <inheritdoc />
    public partial class FixPlanPositionSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "PlanPositions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "document_date", "document_number", "planning_period" },
                values: new object[] { new DateTime(2024, 1, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "ПП-2024-001", "1 квартал 2024" });

            migrationBuilder.UpdateData(
                table: "PlanPositions",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "document_date", "document_number", "planning_period" },
                values: new object[] { new DateTime(2024, 1, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "ПП-2024-002", "1 квартал 2024" });

            migrationBuilder.UpdateData(
                table: "PlanPositions",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "document_date", "document_number", "planning_period" },
                values: new object[] { new DateTime(2024, 1, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), "ПП-2024-003", "1 квартал 2024" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "PlanPositions",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "document_date", "document_number", "planning_period" },
                values: new object[] { new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", null });

            migrationBuilder.UpdateData(
                table: "PlanPositions",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "document_date", "document_number", "planning_period" },
                values: new object[] { new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", null });

            migrationBuilder.UpdateData(
                table: "PlanPositions",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "document_date", "document_number", "planning_period" },
                values: new object[] { new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", null });
        }
    }
}
