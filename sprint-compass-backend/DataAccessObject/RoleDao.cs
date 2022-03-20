using SprintCompassBackend.DataAccessLayer;
using System;
using System.Collections.Generic;
using MySql.Data.MySqlClient;
using System.Threading.Tasks;
using System.Data.Common;

namespace SprintCompassBackend.DataAccessObject
{
    public class RoleDao
    {
        private DatabaseConnectionContext _dbConnCtx;

        public RoleDao(DatabaseConnectionContext dbConnCtx)
        {
            _dbConnCtx = dbConnCtx;
        }

        public async Task<List<string>> GetRoles()
        {
            List<string> rolesList = new List<string>();
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
                    _ = resultReader.GetInt32(0); // Role id
                    string roleName = resultReader.GetString(1);

                    rolesList.Add(roleName);
                }
            }
            catch (Exception)
            {
                // TODO: Log exception
            }

            return rolesList;
        }
    }
}
