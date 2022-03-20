using Microsoft.AspNetCore.Mvc;
using SprintCompassBackend.DataAccessLayer;
using SprintCompassBackend.DataAccessObject;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SprintCompassBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly DatabaseConnectionContext _dbConnCtx;

        public RoleController(DatabaseConnectionContext dbConnCtx)
        {
            _dbConnCtx = dbConnCtx;
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
