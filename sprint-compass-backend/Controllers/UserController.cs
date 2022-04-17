// File Name:    UserController.cs
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
    public class UserController : ControllerBase
    {
        private readonly DatabaseConnectionContext _dbConnCtx;
        private readonly ILogger<UserController>? _logger;

        public UserController(DatabaseConnectionContext dbConnCtx, ILogger<UserController>? logger = null)
        {
            _dbConnCtx = dbConnCtx;
            _logger = logger;

            _logger?.LogInformation("A {0} instance has been created!", "UserController");
        }

        [HttpGet]
        [Produces("application/json")]
        public async Task<List<User>> GetUsers()
        {
            UserDao userDao = new UserDao(_dbConnCtx, _logger);
            return await userDao.GetUsers();
        }

        [HttpPost]
        [Produces("application/json")]
        public async Task<object> AddUser
        (
            [FromBody]
            JsonElement requestBodyJson
        )
        {
            User? user = null;

            if (requestBodyJson.TryGetProperty("jsonRequestBody", out JsonElement projectInformation))
            {
                UserDao userDao = new UserDao(_dbConnCtx, _logger);

                _ = projectInformation.TryGetProperty("firstName", out JsonElement firstNameJson);
                _ = projectInformation.TryGetProperty("lastName", out JsonElement lastNameJson);

                string firstName = (firstNameJson.GetString() ?? string.Empty).Trim();
                string lastName = (lastNameJson.GetString() ?? string.Empty).Trim();

                user = await userDao.AddUser(firstName, lastName);
            }

            return new
            {
                Success = user is not null,
                AddedUser = user
            };
        }

        [HttpDelete("{userId}")]
        [Produces("application/json")]
        public async Task<object> DeleteUser(int userId)
        {
            UserDao userDao = new UserDao(_dbConnCtx, _logger);

            bool? isUserInTeam = await userDao.IsUserInTeam(userId);

            if (isUserInTeam is null)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }

            string errorMessage = string.Empty;
            bool userDeleted = false;
            
            if (!isUserInTeam.Value)
            {
                userDeleted = await userDao.DeleteUser(userId);
            }
            else
            {
                errorMessage = "Unable to delete the user because they are currently active in one or more teams!";
            }

            return new
            {
                ErrorMessage = errorMessage,
                UserDeleted = userDeleted
            };
        }
    }
}
