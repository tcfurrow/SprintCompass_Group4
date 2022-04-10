using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SprintCompassBackend.DataAccessLayer;
using SprintCompassBackend.DataAccessObject;
using SprintCompassBackend.Entities;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

#nullable enable

namespace SprintCompassBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TeamController : ControllerBase
    {
        private readonly DatabaseConnectionContext _dbConnCtx;
        private readonly ILogger? _logger;

        public TeamController(DatabaseConnectionContext dbConnCtx, ILogger? logger = null)
        {
            _dbConnCtx = dbConnCtx;
            _logger = logger;
        } 

        [HttpGet]
        [Produces("application/json")]
        public async Task<List<Team>> GetTeams()
        {
            TeamDao teamDao = new TeamDao(_dbConnCtx, _logger);
            return await teamDao.GetTeams();
        }

        [HttpPost]
        [Produces("application/json")]
        public async Task<object> CreateTeam
        (
            [FromBody]
            JsonElement requestBodyJson
        )
        {
            TeamDao teamDao = new TeamDao(_dbConnCtx, _logger);
            bool teamAdded = false;

            if (requestBodyJson.TryGetProperty("jsonRequestBody", out JsonElement projectInformation))
            {
                _ = projectInformation.TryGetProperty("projectName", out JsonElement teamNameJson);
                string teamName = teamNameJson.GetString() ?? "";
                teamAdded = await teamDao.AddTeam(teamName);
            }

            return new
            {
                TeamAdded = teamAdded
            };
        }

        [HttpPost]
        [Produces("application/json")]
        public async Task<object?> AddTeamMember
       (
           [FromBody]
            JsonElement requestBodyJson
       )
        {
            TeamDao teamDao = new TeamDao(_dbConnCtx, _logger);
            Team? teamMemberAdded = null;

            // TODO: Maybe validate the data from the client (such as preventing duplicate project names from existing
            //       for a team.
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
                Error = teamMemberAdded is null,
                AddedTeamMember = teamMemberAdded
            };
        }
    }
}