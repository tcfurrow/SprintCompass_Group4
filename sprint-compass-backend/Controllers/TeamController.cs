// File Name:    TeamController.cs
// By:           Darian Benam, Jordan Fox, and Teresa Furrow

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SprintCompassBackend.DataAccessLayer;
using SprintCompassBackend.DataAccessObject;
using SprintCompassBackend.Entities;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

namespace SprintCompassBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TeamController : ControllerBase
    {
        private readonly DatabaseConnectionContext _dbConnCtx;
        private readonly ILogger<TeamController>? _logger;

        public TeamController(DatabaseConnectionContext dbConnCtx, ILogger<TeamController>? logger = null)
        {
            _dbConnCtx = dbConnCtx;
            _logger = logger;

            _logger?.LogInformation("A {0} instance has been created!", "TeamController");
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
            Team? createdTeam = null;

            if (requestBodyJson.TryGetProperty("jsonRequestBody", out JsonElement projectInformation))
            {
                _ = projectInformation.TryGetProperty("name", out JsonElement teamNameJson);
                string teamName = teamNameJson.GetString() ?? "";

                createdTeam = await teamDao.CreateTeam(teamName);
            }

            return new
            {
                Success = createdTeam is not null,
                Team = createdTeam
            };
        }
    }
}