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
    public class SprintController : ControllerBase
    {
        private readonly DatabaseConnectionContext _dbConnCtx;
        private readonly ILogger<SprintController>? _logger;

        public SprintController(DatabaseConnectionContext dbConnCtx, ILogger<SprintController>? logger = null)
        {
            _dbConnCtx = dbConnCtx;
            _logger = logger;

            _logger?.LogInformation("A {0} instance has been created!", "SprintController");
        }

        [HttpGet("{projectId}")]
        [Produces("application/json")]
        public async Task<List<Sprint>> GetSprintsByProjectId(int projectId)
        {
            SprintDao sprintDao = new SprintDao(_dbConnCtx, _logger);
            return await sprintDao.GetSprintsByProjectId(projectId);
        }

        [HttpPost("{projectId}")]
        [Produces("application/json")]
        public async Task<object> CreateSprint
        (
            int projectId,
            [FromBody]
            JsonElement requestBodyJson
        )
        {
            SprintDao sprintDao = new SprintDao(_dbConnCtx, _logger);

            bool hasJsonBody = requestBodyJson.TryGetProperty("jsonRequestBody", out JsonElement sprintInformation);
            bool sprintAdded = false;

            if (hasJsonBody)
            {
                _ = sprintInformation.TryGetProperty("sprintName", out JsonElement sprintNameJson);
                string sprintName = sprintNameJson.GetString() ?? string.Empty;

                if (sprintName != string.Empty)
                {
                    sprintAdded = await sprintDao.CreateSprint(projectId, sprintName);
                }
            }

            return new
            {
                SprintAdded = sprintAdded
            };
        }

        [HttpDelete("{sprintId}")]
        [Produces("application/json")]
        public async Task<object> DeleteSprint(int sprintId)
        {
            SprintDao sprintDao = new SprintDao(_dbConnCtx, _logger);
            bool sprintedDeleted = await sprintDao.DeleteSprintById(sprintId);

            return new
            {
                SprintDeleted = sprintedDeleted
            };
        }
    }
}
