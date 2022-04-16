// File Name:    ProjectController.cs
// By:           Darian Benam, Jordan Fox, and Teresa Furrow

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SprintCompassBackend.DataAccessLayer;
using SprintCompassBackend.DataAccessObject;
using SprintCompassBackend.Entities;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

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

            _logger?.LogInformation("A {0} instance has been created!", "ProjectController");
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

            // TODO: Maybe validate the data from the client (such as preventing duplicate project names from existing
            //       for a team.
            if (requestBodyJson.TryGetProperty("jsonRequestBody", out JsonElement projectInformation))
            {
                _ = projectInformation.TryGetProperty("projectName", out JsonElement projectNameJson);
                _ = projectInformation.TryGetProperty("projectDescription", out JsonElement projectDescriptionJson);
                _ = projectInformation.TryGetProperty("teamId", out JsonElement teamIdJson);

                string projectName = (projectNameJson.GetString() ?? string.Empty).Trim();
                string projectDescription = (projectDescriptionJson.GetString() ?? string.Empty).Trim();

                if (!teamIdJson.TryGetInt32(out int teamId))
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