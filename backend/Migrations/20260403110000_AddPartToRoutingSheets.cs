using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using RoutingSheetsNew.Data;

#nullable disable

namespace RoutingSheetsNew.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260403110000_AddPartToRoutingSheets")]
    public partial class AddPartToRoutingSheets : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "part_id",
                table: "RoutingSheets",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RoutingSheets_part_id",
                table: "RoutingSheets",
                column: "part_id");

            migrationBuilder.CreateIndex(
                name: "IX_RoutingSheets_plan_position_id_part_id",
                table: "RoutingSheets",
                columns: new[] { "plan_position_id", "part_id" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RoutingSheets_part_id",
                table: "RoutingSheets");

            migrationBuilder.DropIndex(
                name: "IX_RoutingSheets_plan_position_id_part_id",
                table: "RoutingSheets");

            migrationBuilder.DropColumn(
                name: "part_id",
                table: "RoutingSheets");
        }
    }
}
