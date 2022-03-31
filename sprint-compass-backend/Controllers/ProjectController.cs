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
    public class ProjectController : ControllerBase
    {
        private readonly DatabaseConnectionContext _dbConnCtx;
        private readonly ILogger? _logger;

        public ProjectController(DatabaseConnectionContext dbConnCtx, ILogger? logger = null)
        {
            _dbConnCtx = dbConnCtx;
            _logger = logger;

            _logger?.LogInformation("A ProjectController instance has been created!");
        }

        [HttpGet("{teamId}")]
        [Produces("application/json")]
        public async Task<List<Project>> GetTeamProjects(int teamId)
        {
            ProjectDao projectDao = new ProjectDao(_dbConnCtx, _logger);

            return await projectDao.GetProjectsByTeamId(teamId);
        }

        [HttpPost]
        [Produces("application/json")]
        public async Task<object?> AddProject
        (
            [FromBody]
            JsonElement requestBodyJson
        )
        {
            ProjectDao projectDao = new ProjectDao(_dbConnCtx, _logger);
            Project? project = null;

            JsonElement projectNameJson;
            JsonElement projectDescriptionJson;
            JsonElement teamIdJson;

            // TODO: Maybe validate the data from the client (such as preventing duplicate project names from existing
            //       for a team.
            if (requestBodyJson.TryGetProperty("jsonRequestBody", out JsonElement projectInformation))
            {
                _ = projectInformation.TryGetProperty("projectName", out projectNameJson);
                _ = projectInformation.TryGetProperty("projectDescription", out projectDescriptionJson);
                _ = projectInformation.TryGetProperty("teamId", out teamIdJson);

                string projectName = (projectNameJson.GetString() ?? string.Empty).Trim();
                string projectDescription = (projectDescriptionJson.GetString() ?? string.Empty).Trim();
                int teamId;

                if (!teamIdJson.TryGetInt32(out teamId))
                {
                    teamId = -1;
                }

                project = await projectDao.AddProject(projectName, projectDescription, teamId);
            }

            return new
            {
                Error = project is null,
                AddedProject = project
            };
        }

        [HttpDelete("{projectId}")]
        [Produces("application/json")]
        public async Task<object> DeleteProject(int projectId)
        {
            ProjectDao projectDao = new ProjectDao(_dbConnCtx, _logger);
            bool projectedDeleted = await projectDao.DeleteProject(projectId);

            return new
            {
                ProjectDeleted = projectedDeleted
            };
        }
    }
}
