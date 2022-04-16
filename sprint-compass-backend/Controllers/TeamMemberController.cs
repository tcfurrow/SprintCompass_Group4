// File Name:    TeamMemberController.cs
// By:           Darian Benam, Jordan Fox, and Teresa Furrow

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SprintCompassBackend.DataAccessLayer;
using SprintCompassBackend.DataAccessObject;
using SprintCompassBackend.Entities;
using System.Text.Json;
using System.Threading.Tasks;

namespace SprintCompassBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TeamMemberController : ControllerBase
    {
        private readonly DatabaseConnectionContext _dbConnCtx;
        private readonly ILogger<TeamMemberController>? _logger;

        public TeamMemberController(DatabaseConnectionContext dbConnCtx, ILogger<TeamMemberController>? logger = null)
        {
            _dbConnCtx = dbConnCtx;
            _logger = logger;

            _logger?.LogInformation("A {0} instance has been created!", "TeamMemberController");
        }

        [HttpPost]
        [Produces("application/json")]
        public async Task<object> AddTeamMember
        (
            [FromBody]
            JsonElement requestBodyJson
        )
        {
            TeamDao teamDao = new TeamDao(_dbConnCtx, _logger);
            Team? teamMemberAdded = null;

            if (requestBodyJson.TryGetProperty("jsonRequestBody", out JsonElement projectInformation))
            {
                _ = projectInformation.TryGetProperty("firstName", out JsonElement firstNameJson);
                _ = projectInformation.TryGetProperty("lastName", out JsonElement lastNameJson);
                _ = projectInformation.TryGetProperty("roleId", out JsonElement roleIdJson);

                string firstName = (firstNameJson.GetString() ?? string.Empty).Trim();
                string lastName = (lastNameJson.GetString() ?? string.Empty).Trim();
                int roleId;

                if (!roleIdJson.TryGetInt32(out roleId))
                {
                    roleId = -1;
                }

                teamMemberAdded = await teamDao.AddMemberToTeam(firstName, lastName, roleId);
            }

            return new
            {
                TeamMemberAdded = teamMemberAdded is null,
                AddedTeamMember = teamMemberAdded
            };
        }
    }
}
