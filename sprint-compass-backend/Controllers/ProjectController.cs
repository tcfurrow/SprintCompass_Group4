using Microsoft.AspNetCore.Mvc;
using SprintCompassBackend.DataAccessLayer;
using SprintCompassBackend.DataAccessObject;
using SprintCompassBackend.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SprintCompassBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectController : ControllerBase
    {
        private readonly DatabaseConnectionContext _dbConnCtx;

        public ProjectController(DatabaseConnectionContext dbConnCtx)
        {
            _dbConnCtx = dbConnCtx;
        }

        [HttpGet("{teamId}")]
        [Produces("application/json")]
        public async Task<List<Project>> GetTeamProjects(int teamId)
        {
            ProjectDao projectDao = new ProjectDao(_dbConnCtx);
            return await projectDao.GetProjectsByTeamId(teamId);
        }
    }
}
