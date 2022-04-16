// File Name:    UserDao.cs
// By:           Darian Benam, Jordan Fox, and Teresa Furrow

using Microsoft.Extensions.Logging;
using MySql.Data.MySqlClient;
using SprintCompassBackend.DataAccessLayer;
using SprintCompassBackend.Entities;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Reflection;
using System.Threading.Tasks;

namespace SprintCompassBackend.DataAccessObject
{
    public class UserDao
    {
        private DatabaseConnectionContext _dbConnCtx;
        private ILogger? _logger;

        public UserDao(DatabaseConnectionContext dbConnCtx, ILogger? logger = null)
        {
            _dbConnCtx = dbConnCtx;
            _logger = logger;

            _logger?.LogInformation("A {0} instance has been created!", "UserDao");
        }

        public async Task<bool?> IsUserInTeam(int userId)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlSelectCmd = new MySqlCommand("SELECT * FROM team_member_list WHERE user_id = ?userId;", dbConn);
                mySqlSelectCmd.Parameters.Add("?userId", MySqlDbType.Int32).Value = userId;

                await mySqlSelectCmd.ExecuteNonQueryAsync();

                DbDataReader resultReader = await mySqlSelectCmd.ExecuteReaderAsync();

                return resultReader.HasRows;
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return null;
        }

        public async Task<List<User>> GetUsers()
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            List<User> userList = new List<User>();

            try
            {
                await dbConn.OpenAsync();
                using MySqlCommand mySqlSelectCmd = new MySqlCommand("SELECT id, first_name, last_name FROM user;", dbConn);
                await mySqlSelectCmd.ExecuteNonQueryAsync();

                DbDataReader resultReader = await mySqlSelectCmd.ExecuteReaderAsync();

                while (await resultReader.ReadAsync())
                {
                    int userId = resultReader.GetInt32(0);
                    string firstName = resultReader.GetString(1);
                    string lastName = resultReader.GetString(2);

                    userList.Add(new User(userId, firstName, lastName));
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return userList;
        }

        public async Task<User?> GetUserById(int userId)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            try
            {
                await dbConn.OpenAsync();
                
                using MySqlCommand mySqlSelectCmd = new MySqlCommand("SELECT id, first_name, last_name FROM user WHERE id = ?userId;", dbConn);
                mySqlSelectCmd.Parameters.Add("?userId", MySqlDbType.VarString).Value = userId;

                await mySqlSelectCmd.ExecuteNonQueryAsync();

                DbDataReader resultReader = await mySqlSelectCmd.ExecuteReaderAsync();

                if (resultReader.HasRows)
                {
                    await resultReader.ReadAsync();

                    string firstName = resultReader.GetString(1);
                    string lastName = resultReader.GetString(2);

                    return new User(userId, firstName, lastName);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return null;
        }

        public async Task<User?> AddUser(string firstName, string lastName)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            try
            {
                await dbConn.OpenAsync();
                
                using MySqlCommand mySqlInsertCmd = new MySqlCommand("INSERT INTO user (first_name, last_name) VALUES (?firstName, ?lastName);", dbConn);
                mySqlInsertCmd.Parameters.Add("?firstName", MySqlDbType.VarString).Value = firstName;
                mySqlInsertCmd.Parameters.Add("?lastName", MySqlDbType.VarString).Value = lastName;

                int totalRowsAdded = await mySqlInsertCmd.ExecuteNonQueryAsync();

                if (totalRowsAdded == 1)
                {
                    int userId = (int)mySqlInsertCmd.LastInsertedId;

                    return new User(userId, firstName, lastName);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return null;
        }

        public async Task<bool> DeleteUser(int userId)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlDeleteCmd = new MySqlCommand("DELETE FROM user WHERE id = ?userId;", dbConn);
                mySqlDeleteCmd.Parameters.Add("?userId", MySqlDbType.Int32).Value = userId;

                int totalRowsDeleted = await mySqlDeleteCmd.ExecuteNonQueryAsync();

                return totalRowsDeleted > 0;
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return false;
        }
    }
}
