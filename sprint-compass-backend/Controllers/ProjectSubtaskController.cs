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
    public class ProjectSubtaskController : ControllerBase
    {
        private readonly DatabaseConnectionContext _dbConnCtx;
        private readonly ILogger<ProjectSubtaskController>? _logger;

        public ProjectSubtaskController(DatabaseConnectionContext dbConnCtx, ILogger<ProjectSubtaskController>? logger = null)
        {
            _dbConnCtx = dbConnCtx;
            _logger = logger;

            _logger?.LogInformation("A {0} instance has been created!", "ProjectSubtaskController");
        }

        [HttpPost]
        [Produces("application/json")]
        public async Task<object> CreateNewSubtask
        (
            [FromBody]
            JsonElement requestBodyJson
        )
        {
            ProjectSubtask? subtask = null;

            if (requestBodyJson.TryGetProperty("jsonRequestBody", out JsonElement projectInformation))
            {
                ProjectSubtaskDao projectSubtaskDao = new ProjectSubtaskDao(_dbConnCtx, _logger);

                _ = projectInformation.TryGetProperty("userStoryId", out JsonElement userStoryIdJson);
                _ = projectInformation.TryGetProperty("subtaskTitle", out JsonElement subtaskTitleJson);

                if (!userStoryIdJson.TryGetInt32(out int userStoryId))
                {
                    userStoryId = -1;
                }

                string subtaskTitle = subtaskTitleJson.GetString() ?? string.Empty;

                subtask = await projectSubtaskDao.CreateSubtask(userStoryId, subtaskTitle);
            }

            return new
            {
                SubtaskCreated = subtask is not null,
                Subtask = subtask
            };
        }

        [HttpPut("{subtaskId}")]
        [Produces("application/json")]
        public async Task<object> UpdateProjectSubtask
        (
            int subtaskId,
            [FromBody]
            JsonElement requestBodyJson
        )
        {
            ProjectSubtask? updatedSubtask = null;

            if (requestBodyJson.TryGetProperty("jsonRequestBody", out JsonElement projectInformation))
            {
                ProjectSubtaskDao projectSubtaskDao = new ProjectSubtaskDao(_dbConnCtx, _logger);

                _ = projectInformation.TryGetProperty("title", out JsonElement subtaskTitleJson);
                _ = projectInformation.TryGetProperty("status", out JsonElement subtaskStatusJson);

                string subtaskTitle = subtaskTitleJson.GetString() ?? string.Empty;
                _ = subtaskStatusJson.TryGetInt32(out int subtaskStatusId);

                updatedSubtask = await projectSubtaskDao.UpdateProjectSubtask(subtaskId, subtaskTitle, (SubtaskStatus)subtaskStatusId);
            }

            return new
            {
                SubtaskUpdated = updatedSubtask is not null,
                Subtask = updatedSubtask
            };
        }

        [HttpDelete("{subtaskId}")]
        [Produces("application/json")]
        public async Task<object> DeleteSubtask(int subtaskId)
        {
            ProjectSubtaskDao projectSubtaskDao = new ProjectSubtaskDao(_dbConnCtx, _logger);
            bool subtaskDeleted = await projectSubtaskDao.DeleteSubtask(subtaskId);

            return new
            {
                SubtaskDeleted = subtaskDeleted
            };
        }
    }
}
