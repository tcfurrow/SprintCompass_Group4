// File Name:    ProjectTaskController.cs
// By:           Darian Benam, Jordan Fox, and Teresa Furrow

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SprintCompassBackend.DataAccessLayer;
using SprintCompassBackend.DataAccessObject;
using SprintCompassBackend.Entities;
using System.Threading.Tasks;

namespace SprintCompassBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectTaskController : ControllerBase
    {
        private readonly DatabaseConnectionContext _dbConnCtx;
        private readonly ILogger<ProjectTaskController>? _logger;

        public ProjectTaskController(DatabaseConnectionContext dbConnCtx, ILogger<ProjectTaskController>? logger = null)
        {
            _dbConnCtx = dbConnCtx;
            _logger = logger;

            _logger?.LogInformation("A {0} instance has been created!", "ProjectTaskController");
        }

        [HttpPost("{sprintId}/{productBacklogId}")]
        [Produces("application/json")]
        public async Task<object> CreateProjectTask(int sprintId, int productBacklogId)
        {
            ProjectTaskDao projectTaskDao = new ProjectTaskDao(_dbConnCtx, _logger);
            ProjectTask? projectTask = await projectTaskDao.CreateProjectTask(sprintId, productBacklogId);

            return new
            {
                ProjectTaskCreated = projectTask is not null,
                ProjectTask = projectTask
            };
        }

        [HttpDelete("{projectTaskId}")]
        [Produces("application/json")]
        public async Task<object> DeleteProjectTask(int projectTaskId)
        {
            ProjectTaskDao projectTaskDao = new ProjectTaskDao(_dbConnCtx, _logger);
            bool projectTaskDeleted = await projectTaskDao.DeleteProjectTask(projectTaskId);

            return new
            {
                ProjectTaskDeleted = projectTaskDeleted
            };
        }
    }
}
