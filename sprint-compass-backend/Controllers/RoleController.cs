using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SprintCompassBackend.DataAccessLayer;
using SprintCompassBackend.DataAccessObject;
using System.Collections.Generic;
using System.Threading.Tasks;

#nullable enable

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

            _logger?.LogInformation("A TeamController instance has been created!");
        }

        [HttpGet]
        [Produces("application/json")]
        public async Task<List<string>> GetRoles()
        {
            RoleDao roleDao = new RoleDao(_dbConnCtx);
            return await roleDao.GetRoles();
        }
    }
}
