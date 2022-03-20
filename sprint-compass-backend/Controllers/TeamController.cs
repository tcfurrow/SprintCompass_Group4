using Microsoft.AspNetCore.Mvc;
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
    public class TeamController : ControllerBase
    {
        private readonly DatabaseConnectionContext _dbConnCtx;

        public TeamController(DatabaseConnectionContext dbConnCtx)
        {
            _dbConnCtx = dbConnCtx;
        }

        [HttpGet]
        [Produces("application/json")]
        public async Task<List<Team>> GetTeams()
        {
            TeamDao teamDao = new TeamDao(_dbConnCtx);
            return await teamDao.GetTeams();
        }

        [HttpPost]
        [Produces("application/json")]
        public async Task<string> CreateTeam([FromBody] string jsonBody)
        {
            throw new NotImplementedException();
        }
    }
}
