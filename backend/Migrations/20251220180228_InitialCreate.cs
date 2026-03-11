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
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Guilds", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OperationStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperationStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OperationTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperationTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Performers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    full_name = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Performers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    quantity_planned = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RoutingSheetStatuses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoutingSheetStatuses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Units",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Units", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlanPositions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    position_code = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    product_item_id = table.Column<int>(type: "int", nullable: false),
                    quantity_planned = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanPositions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlanPositions_ProductItems_product_item_id",
                        column: x => x.product_item_id,
                        principalTable: "ProductItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RoutingSheets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Number = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    plan_position_id = table.Column<int>(type: "int", nullable: true),
                    product_item_id = table.Column<int>(type: "int", nullable: true),
                    unit_id = table.Column<int>(type: "int", nullable: true),
                    status_id = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
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
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    routing_sheet_id = table.Column<int>(type: "int", nullable: false),
                    seq_number = table.Column<int>(type: "int", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Name = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    status_id = table.Column<int>(type: "int", nullable: true),
                    guild_id = table.Column<int>(type: "int", nullable: true),
                    operation_type_id = table.Column<int>(type: "int", nullable: true),
                    performer_id = table.Column<int>(type: "int", nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Sum = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false)
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
                table: "RoutingSheetStatuses",
                columns: new[] { "Id", "Code", "Name" },
                values: new object[,]
                {
                    { 1, "DRAFT", "Черновик" },
                    { 2, "ACTIVE", "Активен" },
                    { 3, "COMPLETED", "Завершен" },
                    { 4, "CANCELLED", "Отменен" }
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
                name: "IX_PlanPositions_position_code",
                table: "PlanPositions",
                column: "position_code");

            migrationBuilder.CreateIndex(
                name: "IX_PlanPositions_product_item_id",
                table: "PlanPositions",
                column: "product_item_id");

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Operations");

            migrationBuilder.DropTable(
                name: "Guilds");

            migrationBuilder.DropTable(
                name: "OperationStatuses");

            migrationBuilder.DropTable(
                name: "OperationTypes");

            migrationBuilder.DropTable(
                name: "Performers");

            migrationBuilder.DropTable(
                name: "RoutingSheets");

            migrationBuilder.DropTable(
                name: "PlanPositions");

            migrationBuilder.DropTable(
                name: "RoutingSheetStatuses");

            migrationBuilder.DropTable(
                name: "Units");

            migrationBuilder.DropTable(
                name: "ProductItems");
        }
    }
}
