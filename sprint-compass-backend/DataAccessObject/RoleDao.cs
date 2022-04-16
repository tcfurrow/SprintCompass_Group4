// File Name:    RoleDao.cs
// By:           Darian Benam, Jordan Fox, and Teresa Furrow

using SprintCompassBackend.DataAccessLayer;
using System;
using System.Collections.Generic;
using MySql.Data.MySqlClient;
using System.Threading.Tasks;
using System.Data.Common;
using Microsoft.Extensions.Logging;
using System.Reflection;
using SprintCompassBackend.Entities;

namespace SprintCompassBackend.DataAccessObject
{
    public class RoleDao
    {
        private DatabaseConnectionContext _dbConnCtx;
        private ILogger? _logger;

        public RoleDao(DatabaseConnectionContext dbConnCtx, ILogger? logger = null)
        {
            _dbConnCtx = dbConnCtx;
            _logger = logger;

            _logger?.LogInformation("A {0} instance has been created!", "RoleDao");
        }

        public async Task<List<Role>> GetRoles()
        {
            List<Role> roleList = new List<Role>();
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();
            
            try
            {
                await dbConn.OpenAsync();
                using MySqlCommand mySqlSelectCmd = new MySqlCommand("SELECT id, name FROM role;", dbConn);
                await mySqlSelectCmd.ExecuteNonQueryAsync();

                DbDataReader resultReader = await mySqlSelectCmd.ExecuteReaderAsync();

                // Read over every row
                while (await resultReader.ReadAsync())
                {
                    int roleId = resultReader.GetInt32(0);
                    string roleName = resultReader.GetString(1);

                    roleList.Add(new Role(roleId, roleName));
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return roleList;
        }
    }
}
