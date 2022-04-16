// File Name:    RoleController.cs
// By:           Darian Benam, Jordan Fox, and Teresa Furrow

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SprintCompassBackend.DataAccessLayer;
using SprintCompassBackend.DataAccessObject;
using SprintCompassBackend.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SprintCompassBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly DatabaseConnectionContext _dbConnCtx;
        private readonly ILogger<RoleController>? _logger;

        public RoleController(DatabaseConnectionContext dbConnCtx, ILogger<RoleController>? logger = null)
        {
            _dbConnCtx = dbConnCtx;
            _logger = logger;

            _logger?.LogInformation("A {0} instance has been created!", "TeamController");
        }

        [HttpGet]
        [Produces("application/json")]
        public async Task<List<Role>> GetRoles()
        {
            RoleDao roleDao = new RoleDao(_dbConnCtx, _logger);
            return await roleDao.GetRoles();
        }
    }
}
