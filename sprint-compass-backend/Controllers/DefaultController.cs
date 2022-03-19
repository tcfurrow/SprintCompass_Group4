using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System;

namespace SprintCompassBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DefaultController : ControllerBase
    {
        private DatabaseConnectionContext _dbConnCtx;

        public DefaultController(DatabaseConnectionContext dbConnCtx)
        {
            _dbConnCtx = dbConnCtx;
        }

        [HttpGet]
        public ActionResult<string> Get()
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            try
            {
                dbConn.Open();
                return "Connection to MySQL database was successfull!";
            }
            catch (Exception)
            {
                return "Failed to connect to the MySQL database!";
            }
        }
    }
}
