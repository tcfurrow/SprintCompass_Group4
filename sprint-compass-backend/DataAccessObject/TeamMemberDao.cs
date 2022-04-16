// File Name:    TeamMemberDao.cs
// By:           Darian Benam, Jordan Fox, and Teresa Furrow

using Microsoft.Extensions.Logging;
using MySql.Data.MySqlClient;
using SprintCompassBackend.DataAccessLayer;
using SprintCompassBackend.Entities;
using System;
using System.Data.Common;
using System.Reflection;
using System.Threading.Tasks;

namespace SprintCompassBackend.DataAccessObject
{
    public class TeamMemberDao
    {
        private DatabaseConnectionContext _dbConnCtx;
        private ILogger? _logger;

        public TeamMemberDao(DatabaseConnectionContext dbConnCtx, ILogger? logger = null)
        {
            _dbConnCtx = dbConnCtx;
            _logger = logger;

            _logger?.LogInformation("A {0} instance has been created!", "TeamMemberDao");
        }

        public async Task<bool?> IsTeamMemberAssignedSubtasks(int teamMemberId)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlSelectCmd = new MySqlCommand("SELECT * FROM sprint_user_story_subtask WHERE team_member_assigned_to_id = ?teamMemberId;", dbConn);
                mySqlSelectCmd.Parameters.Add("?teamMemberId", MySqlDbType.Int32).Value = teamMemberId;

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

        public async Task<TeamMember?> UpdateTeamMember(int teamMemberId, TeamMemberRole role)
        {
            if (teamMemberId <= 0)
            {
                return null;
            }

            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlUpdateCmd = new MySqlCommand("UPDATE team_member_list SET role_id = ?roleId WHERE id = ?teamMemberId;", dbConn);
                mySqlUpdateCmd.Parameters.Add("?teamMemberId", MySqlDbType.Int32).Value = teamMemberId;
                mySqlUpdateCmd.Parameters.Add("?roleId", MySqlDbType.Int32).Value = role;

                int rowsUpdated = await mySqlUpdateCmd.ExecuteNonQueryAsync();

                if (rowsUpdated > 0)
                {
                    TeamDao teamDao = new TeamDao(_dbConnCtx, _logger);
                    return await teamDao.GetTeamMemberById(teamMemberId);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return null;
        }

        public async Task<bool> DeleteTeamMember(int teamMemberId)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlDeleteCmd = new MySqlCommand("DELETE FROM team_member_list WHERE id = ?teamMemberId;", dbConn);
                mySqlDeleteCmd.Parameters.Add("?teamMemberId", MySqlDbType.Int32).Value = teamMemberId;

                int numberOfRowsDeleted = await mySqlDeleteCmd.ExecuteNonQueryAsync();

                return numberOfRowsDeleted > 0;
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return false;
        }
    }
}
