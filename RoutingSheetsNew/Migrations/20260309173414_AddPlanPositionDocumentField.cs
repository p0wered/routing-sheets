using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RoutingSheetsNew.Migrations
{
    /// <inheritdoc />
    public partial class AddPlanPositionDocumentField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "document_date",
                table: "PlanPositions",
                type: "date",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "document_number",
                table: "PlanPositions",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "document_date",
                table: "PlanPositions");

            migrationBuilder.DropColumn(
                name: "document_number",
                table: "PlanPositions");

            migrationBuilder.DropColumn(
                name: "planning_period",
                table: "PlanPositions");
        }
    }
}
