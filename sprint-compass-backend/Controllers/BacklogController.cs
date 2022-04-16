// File Name:    BacklogController.cs
// By:           Darian Benam, Jordan Fox, and Teresa Furrow

using Microsoft.AspNetCore.Http;
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
        public async Task<List<ProductBacklogTask>> GetBacklog(int projectId)
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
            ProductBacklogTask? backlogTask = null;

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

        [HttpDelete("{productBacklogTaskId}")]
        [Produces("application/json")]
        public async Task<object> DeleteBacklogTask(int productBacklogTaskId)
        {
            BacklogDao backlogDao = new BacklogDao(_dbConnCtx, _logger);
            
            bool? isReferenced = await backlogDao.IsProductBacklogTaskReferenced(productBacklogTaskId);
            bool productBacklogTaskDeleted = false;

            if (isReferenced is null)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }

            string errorMessage = string.Empty;

            if (!isReferenced.Value)
            {
                productBacklogTaskDeleted = await backlogDao.DeleteProductBacklogTaskById(productBacklogTaskId);
            }
            else
            {
                errorMessage = "The product backlog is currently referenced by project tasks!";
            }

            return new
            {
                ErrorMessage = errorMessage,
                ProductBacklogTaskDeleted = productBacklogTaskDeleted
            };
        }
    }
}
