// File Name:    ProjectSubtaskDao.cs
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
    public class ProjectSubtaskDao
    {
        private DatabaseConnectionContext _dbConnCtx;
        private ILogger? _logger;

        public ProjectSubtaskDao(DatabaseConnectionContext dbConnCtx, ILogger? logger = null)
        {
            _dbConnCtx = dbConnCtx;
            _logger = logger;

            _logger?.LogInformation("A {0} instance has been created!", "ProjectSubtaskDao");
        }

        public async Task<ProjectSubtask?> CreateSubtask(int projectTaskId, string title)
        {
            if (projectTaskId < 0 || string.IsNullOrWhiteSpace(title))
            {
                return null;
            }

            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlInsertCmd = new MySqlCommand("INSERT INTO sprint_user_story_subtask (sprint_user_story_id, title, status_id) VALUES (?projectTaskId, ?title, 0);", dbConn);
                mySqlInsertCmd.Parameters.Add("?projectTaskId", MySqlDbType.Int32).Value = projectTaskId;
                mySqlInsertCmd.Parameters.Add("?title", MySqlDbType.VarString).Value = title;

                int rowsInserted = await mySqlInsertCmd.ExecuteNonQueryAsync();

                if (rowsInserted == 1)
                {
                    int subtaskId = (int)mySqlInsertCmd.LastInsertedId;

                    return new ProjectSubtask(subtaskId, title, null, SubtaskStatus.Open, 0.0, 0.0);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return null;
        }

        public async Task<List<ProjectSubtask>?> GetUserStorySubtaskList(int projectTaskId)
        {
            if (projectTaskId < 0)
            {
                return null;
            }

            using MySqlConnection dbConn = _dbConnCtx.GetConnection();
            List<ProjectSubtask> projectSubtasks = new List<ProjectSubtask>();

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlSelectCmd = new MySqlCommand("SELECT id, title, team_member_assigned_to_id, status_id, total_hours_worked, hours_reestimate FROM sprint_user_story_subtask WHERE sprint_user_story_id = ?projectTaskId;", dbConn);
                mySqlSelectCmd.Parameters.Add("?projectTaskId", MySqlDbType.Int32).Value = projectTaskId;

                await mySqlSelectCmd.ExecuteNonQueryAsync();

                DbDataReader resultReader = await mySqlSelectCmd.ExecuteReaderAsync();

                while (await resultReader.ReadAsync())
                {
                    int subtaskId = resultReader.GetInt32(0);
                    string subtaskTitle = resultReader.GetString(1);
                    TeamMember? assignedTo = null;
                    SubtaskStatus subtaskStatus = (SubtaskStatus)resultReader.GetInt32(3);
                    double subtaskTotalHoursWorked = resultReader.GetDouble(4);
                    double hoursReestimate = resultReader.GetDouble(5);

                    if (!await resultReader.IsDBNullAsync(2))
                    {
                        TeamDao teamDao = new TeamDao(_dbConnCtx, _logger);
                        int teamMemberUserId = resultReader.GetInt32(2);

                        assignedTo = await teamDao.GetTeamMemberById(teamMemberUserId);
                    }

                    projectSubtasks.Add(new ProjectSubtask(subtaskId, subtaskTitle, assignedTo, subtaskStatus, subtaskTotalHoursWorked, hoursReestimate));
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return projectSubtasks;
        }

        public async Task<ProjectSubtask?> UpdateProjectSubtask(int subtaskId, string title, int? teamMemberUserId, SubtaskStatus status, double totalHoursWorked, double hoursReestimate)
        {
            if (subtaskId <= 0 || totalHoursWorked < 0.0)
            {
                return null;
            }

            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlUpdateCmd = new MySqlCommand("UPDATE sprint_user_story_subtask SET title = ?title, team_member_assigned_to_id = ?assignedTo, status_id = ?statusId, total_hours_worked = ?totalHoursWorked, hours_reestimate = ?hoursReestimate WHERE id = ?subtaskId;", dbConn);
                mySqlUpdateCmd.Parameters.Add("?title", MySqlDbType.VarString).Value = title;
                mySqlUpdateCmd.Parameters.Add("?assignedTo", MySqlDbType.Int32).Value = teamMemberUserId;
                mySqlUpdateCmd.Parameters.Add("?statusId", MySqlDbType.Int32).Value = status;
                mySqlUpdateCmd.Parameters.Add("?subtaskId", MySqlDbType.Int32).Value = subtaskId;
                mySqlUpdateCmd.Parameters.Add("?totalHoursWorked", MySqlDbType.Double).Value = totalHoursWorked;
                mySqlUpdateCmd.Parameters.Add("?hoursReestimate", MySqlDbType.Double).Value = hoursReestimate;

                int rowsUpdated = await mySqlUpdateCmd.ExecuteNonQueryAsync();
                    
                if (rowsUpdated > 0)
                {
                    TeamMember? assignedTo = null;

                    if (teamMemberUserId is not null)
                    {
                        TeamDao teamDao = new TeamDao(_dbConnCtx, _logger);
                        assignedTo = await teamDao.GetTeamMemberById(teamMemberUserId.Value);
                    }

                    return new ProjectSubtask(subtaskId, title, assignedTo, status, totalHoursWorked, hoursReestimate);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return null;
        }

        public async Task<bool> DeleteSubtask(int subtaskId)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();
            bool subtaskDeleted = false;

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlDeleteCmd = new MySqlCommand("DELETE FROM sprint_user_story_subtask WHERE id = ?subtaskId;", dbConn);
                mySqlDeleteCmd.Parameters.Add("?subtaskId", MySqlDbType.Int32).Value = subtaskId;

                int numberOfRowsDeleted = await mySqlDeleteCmd.ExecuteNonQueryAsync();

                subtaskDeleted = numberOfRowsDeleted > 0;
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return subtaskDeleted;
        }
    }
}
