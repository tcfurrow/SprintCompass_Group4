// File Name:    TeamMemberController.cs
// By:           Darian Benam, Jordan Fox, and Teresa Furrow

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SprintCompassBackend.DataAccessLayer;
using SprintCompassBackend.DataAccessObject;
using SprintCompassBackend.Entities;
using System;
using System.Collections.Generic;
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

        [HttpGet("{teamId}")]
        [Produces("application/json")]
        public async Task<List<TeamMember>> GetTeamMembers(int teamId)
        {
            TeamDao teamDao = new TeamDao(_dbConnCtx, _logger);
            return await teamDao.GetTeamMembersByTeamId(teamId);
        }

        // Note from Darian: This method does not check if the team member already is added to the team. It would be better to do this.
        [HttpPost("{teamId}/{userId}/{roleId}")]
        [Produces("application/json")]
        public async Task<object> AddTeamMember(int teamId, int userId, int roleId)
        {
            TeamDao teamDao = new TeamDao(_dbConnCtx, _logger);
            TeamMember? addedTeamMember = await teamDao.AddMemberToTeam(teamId, userId, roleId);

            return new
            {
                TeamMemberAdded = addedTeamMember is not null,
                AddedTeamMember = addedTeamMember
            };
        }

        [HttpPut("{teamMemberId}/{roleId}")]
        [Produces("application/json")]
        public async Task<object> UpdateTeamMember(int teamMemberId, int roleId)
        {
            TeamMemberDao teamMemberDao = new TeamMemberDao(_dbConnCtx, _logger);

            TeamMemberRole teamMemberRole = (TeamMemberRole)roleId;
            TeamMember? updatedTeamMember = await teamMemberDao.UpdateTeamMember(teamMemberId, teamMemberRole);

            return new
            {
                Success = updatedTeamMember is not null,
                UpdatedTeamMember = updatedTeamMember
            };
        }

        [HttpDelete("{teamMemberId}")]
        [Produces("application/json")]
        public async Task<object> DeleteTeamMember(int teamMemberId)
        {
            TeamMemberDao teamMemberDao = new TeamMemberDao(_dbConnCtx, _logger);

            bool? hasSubtasks = await teamMemberDao.IsTeamMemberAssignedSubtasks(teamMemberId);

            if (hasSubtasks is null)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }

            string errorMessage = string.Empty;
            bool teamMemberDeleted = false;

            if (hasSubtasks.Value)
            {
                errorMessage = "This team member currently has subtasks assigned to them!";
            }
            else
            {
                teamMemberDeleted = await teamMemberDao.DeleteTeamMember(teamMemberId);
            }

            return new
            {
                ErrorMessage = errorMessage,
                TeamMemberDeleted = teamMemberDeleted
            };
        }
    }
}
