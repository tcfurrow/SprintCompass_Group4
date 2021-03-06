// File Name:    TeamDao.cs
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

#nullable enable

namespace SprintCompassBackend.DataAccessObject
{
    public class TeamDao
    {
        private DatabaseConnectionContext _dbConnCtx;
        private ILogger? _logger;

        public TeamDao(DatabaseConnectionContext dbConnCtx, ILogger? logger = null)
        {
            _dbConnCtx = dbConnCtx;
            _logger = logger;

            _logger?.LogInformation("A {0} instance has been created!", "TeamDao");
        }

        public async Task<Team?> CreateTeam(string teamName)
        {
            if (string.IsNullOrWhiteSpace(teamName))
            {
                return null;
            }

            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlInsertCmd = new MySqlCommand("INSERT INTO team (name) VALUES (?teamName);", dbConn);
                mySqlInsertCmd.Parameters.Add("?teamName", MySqlDbType.VarString).Value = teamName;

                int totalRowsAdded = await mySqlInsertCmd.ExecuteNonQueryAsync();

                if (totalRowsAdded == 1)
                {
                    int teamId = (int)mySqlInsertCmd.LastInsertedId;

                    return new Team(teamId, teamName);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return null;
        }

        public async Task<TeamMember?> AddMemberToTeam(int teamId, int userId, int roleId)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            UserDao userDao = new UserDao(_dbConnCtx, _logger);
            User? user = await userDao.GetUserById(userId);

            if (user is null)
            {
                return null;
            }

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlInsertCmd = new MySqlCommand("INSERT INTO team_member_list (team_id, user_id, role_id) VALUES (?teamId, ?userId, ?roleId);", dbConn);
                mySqlInsertCmd.Parameters.Add("?teamId", MySqlDbType.Int32).Value = teamId;
                mySqlInsertCmd.Parameters.Add("?userId", MySqlDbType.Int32).Value = userId;
                mySqlInsertCmd.Parameters.Add("?roleId", MySqlDbType.Int32).Value = roleId;

                int totalRowsAdded = await mySqlInsertCmd.ExecuteNonQueryAsync();

                if (totalRowsAdded == 1)
                {
                    int teamMemberId = (int)mySqlInsertCmd.LastInsertedId;

                    return new TeamMember(teamMemberId, user, roleId);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return null;
        }

        public async Task<bool> RemoveMemberFromTeam(int teamId, int userId)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();
            bool userRemoved = false;

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlInsertCmd = new MySqlCommand("DELETE FROM team_member_list WHERE team_id = ?teamId AND user_id = ?userId;", dbConn);
                mySqlInsertCmd.Parameters.Add("?teamId", MySqlDbType.Int32).Value = teamId;
                mySqlInsertCmd.Parameters.Add("?userId", MySqlDbType.Int32).Value = userId;

                int totalRowsDeleted = await mySqlInsertCmd.ExecuteNonQueryAsync();
                userRemoved = totalRowsDeleted >= 1;
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return userRemoved;
        }

        public async Task<List<Team>> GetTeams()
        {
            List<Team> teamList = new List<Team>();
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            try
            {
                await dbConn.OpenAsync();
                using MySqlCommand mySqlSelectCmd = new MySqlCommand("SELECT id, name FROM team;", dbConn);
                await mySqlSelectCmd.ExecuteNonQueryAsync();

                DbDataReader resultReader = await mySqlSelectCmd.ExecuteReaderAsync();

                // Read over every row
                while (await resultReader.ReadAsync())
                {
                    int teamId = resultReader.GetInt32(0);
                    string teamName = resultReader.GetString(1);
                    List<TeamMember> teamMembers = await GetTeamMembersByTeamId(teamId);

                    teamList.Add(new Team(teamId, teamName, teamMembers));
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return teamList;
        }

        public async Task<Team?> GetTeamById(int teamId)
        {
            Team? team = null;
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlSelectCmd = new MySqlCommand("SELECT id, name FROM team WHERE id = ?teamId;", dbConn);
                mySqlSelectCmd.Parameters.Add("?teamId", MySqlDbType.Int32).Value = teamId;

                await mySqlSelectCmd.ExecuteNonQueryAsync();

                // Only read one row if this query returns any. If the query doesn't return any rows then
                // the "team" variable will be null.

                DbDataReader resultReader = await mySqlSelectCmd.ExecuteReaderAsync();

                if (resultReader.HasRows)
                {
                    await resultReader.ReadAsync();

                    string teamName = resultReader.GetString(1);
                    List<TeamMember> teamMembers = await GetTeamMembersByTeamId(teamId);

                    team = new Team(teamId, teamName, teamMembers);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return team;
        }

        public async Task<List<TeamMember>> GetTeamMembersByTeamId(int teamId)
        {
            List<TeamMember> teamMemberList = new List<TeamMember>();
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlSelectCmd = new MySqlCommand("SELECT tml.id, tml.team_id, tml.user_id, tml.role_id, user.first_name, user.last_name FROM team_member_list tml INNER JOIN user ON user.id = user_id WHERE team_id = ?teamId;", dbConn);
                mySqlSelectCmd.Parameters.Add("?teamId", MySqlDbType.Int32).Value = teamId;

                await mySqlSelectCmd.ExecuteNonQueryAsync();

                DbDataReader resultReader = await mySqlSelectCmd.ExecuteReaderAsync();

                // Read over every row
                while (await resultReader.ReadAsync())
                {
                    int teamMemberId = resultReader.GetInt32(0);
                    int userId = resultReader.GetInt32(2);
                    int roleId = resultReader.GetInt32(3);
                    string firstName = resultReader.GetString(4);
                    string lastName = resultReader.GetString(5);

                    User user = new User(userId, firstName, lastName);

                    teamMemberList.Add(new TeamMember(teamMemberId, user, roleId));
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return teamMemberList;
        }

        public async Task<TeamMember?> GetTeamMemberById(int teamMemberId)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlSelectCmd = new MySqlCommand("SELECT tml.id, tml.team_id, tml.user_id, tml.role_id, user.first_name, user.last_name FROM team_member_list tml INNER JOIN user ON user.id = tml.user_id WHERE tml.id = ?teamMemberId;", dbConn);
                mySqlSelectCmd.Parameters.Add("?teamMemberId", MySqlDbType.Int32).Value = teamMemberId;

                await mySqlSelectCmd.ExecuteNonQueryAsync();

                DbDataReader resultReader = await mySqlSelectCmd.ExecuteReaderAsync();

                if (resultReader.HasRows)
                {
                    await resultReader.ReadAsync();

                    int userId = resultReader.GetInt32(2);
                    int roleId = resultReader.GetInt32(3);
                    string firstName = resultReader.GetString(4);
                    string lastName = resultReader.GetString(5);

                    User user = new User(userId, firstName, lastName);

                    return new TeamMember(teamMemberId, user, roleId);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return null;
        }
    }
}