using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SprintCompassBackend.DataAccessLayer;
using SprintCompassBackend.DataAccessObject;
using SprintCompassBackend.Entities;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

#nullable enable

namespace SprintCompassBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BacklogController : ControllerBase
    {
        private readonly DatabaseConnectionContext _dbConnCtx;
        private readonly ILogger? _logger;

        public BacklogController(DatabaseConnectionContext dbConnCtx, ILogger? logger = null)
        {
            _dbConnCtx = dbConnCtx;
            _logger = logger;

            _logger?.LogInformation("A BacklogController instance has been created!");
        }

        [HttpGet("{projectId}")]
        [Produces("application/json")]
        public async Task<List<ProjectTask>> GetBacklog(int projectId)
        {
            BacklogDao backlogDao = new BacklogDao(_dbConnCtx, _logger);

            return await backlogDao.GetProductBacklog(projectId);
        }

        [HttpPost]
        [Produces("application/json")]
        public async Task<object?> AddBacklogTask
        (
            [FromBody]
            JsonElement requestBodyJson
        )
        {
            BacklogDao backlogDao = new BacklogDao(_dbConnCtx, _logger);
            ProjectTask? backlogTask = null;

            JsonElement projectIdJson;
            JsonElement titleJson;
            JsonElement descriptionJson;
            JsonElement priorityJson;
            JsonElement relativeEstimateJson;
            JsonElement costJson;

            // TODO: Maybe validate the data from the client (such as preventing duplicate project names from existing
            //       for a team.
            if (requestBodyJson.TryGetProperty("jsonRequestBody", out JsonElement backlogTaskInformation))
            {
                _ = backlogTaskInformation.TryGetProperty("projectId", out projectIdJson);
                _ = backlogTaskInformation.TryGetProperty("title", out titleJson);
                _ = backlogTaskInformation.TryGetProperty("description", out descriptionJson);
                _ = backlogTaskInformation.TryGetProperty("priority", out priorityJson);
                _ = backlogTaskInformation.TryGetProperty("relativeEstimate", out relativeEstimateJson);
                _ = backlogTaskInformation.TryGetProperty("cost", out costJson);

                string title = (titleJson.GetString() ?? string.Empty).Trim();
                string description = (descriptionJson.GetString() ?? string.Empty).Trim();

                int projectId;

                if (!projectIdJson.TryGetInt32(out projectId))
                {
                    projectId = -1;
                }

                int priority;

                if (!priorityJson.TryGetInt32(out priority))
                {
                    priority = -1;
                }

                int relativeEstimate;

                if (!relativeEstimateJson.TryGetInt32(out relativeEstimate))
                {
                    relativeEstimate = -1;
                }

                int cost;

                if (!costJson.TryGetInt32(out cost))
                {
                    cost = -1;
                }

                backlogTask = await backlogDao.AddProjectTask(projectId, title, description, priority, relativeEstimate, cost);
            }

            return new
            {
                Error = backlogTask is null,
                AddedProject = backlogTask
            };
        }

        [HttpPut("{projectId}")]
        [Produces("application/json")]
        public async Task<object?> UpdateProject
        (
            int projectId,
            [FromBody]
            JsonElement requestBodyJson
        )
        {
            bool projectUpdated = false;
            bool hasJsonBody = requestBodyJson.TryGetProperty("jsonRequestBody", out JsonElement updateInformation);

            if (hasJsonBody)
            {
                _ = updateInformation.TryGetProperty("projectName", out JsonElement projectNameJson);
                _ = updateInformation.TryGetProperty("projectDescription", out JsonElement projectDescriptionJson);
                _ = updateInformation.TryGetProperty("projectStartDate", out JsonElement projectStartDateJson);

                ProjectDao projectDao = new ProjectDao(_dbConnCtx, _logger);
                Project? projectToUpdate = await projectDao.GetProjectById(projectId);

                if (projectToUpdate is not null)
                {
                    projectToUpdate.Name = projectNameJson.GetString() ?? projectToUpdate.Name;
                    projectToUpdate.Description = projectDescriptionJson.GetString() ?? projectToUpdate.Description;

                    DateTime startDate;

                    if (!projectStartDateJson.TryGetDateTime(out startDate))
                    {
                        startDate = default;
                    }

                    projectToUpdate.StartDate = startDate == default
                        ? projectToUpdate.StartDate
                        : startDate;

                    projectUpdated = await projectDao.UpdateProject(projectToUpdate);
                }
            }

            return new
            {
                ProjectUpdated = projectUpdated
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
