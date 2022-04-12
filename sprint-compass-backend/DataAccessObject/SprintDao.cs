using Microsoft.Extensions.Logging;
using MySql.Data.MySqlClient;
using SprintCompassBackend.DataAccessLayer;
using SprintCompassBackend.Entities;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace SprintCompassBackend.DataAccessObject
{
    public class SprintDao
    {
        private DatabaseConnectionContext _dbConnCtx;
        private ILogger? _logger;

        public SprintDao(DatabaseConnectionContext dbConnCtx, ILogger? logger = null)
        {
            _dbConnCtx = dbConnCtx;
            _logger = logger;

            _logger?.LogInformation("A {0} instance has been created!", "SprintDao");
        }

        public async Task<bool> CreateSprint(int projectId, string name)
        {
            if (projectId < 0)
            {
                return false;
            }

            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlInsertCmd = new MySqlCommand("INSERT INTO sprint (project_id, name) VALUES (?projectId, ?name);", dbConn);
                mySqlInsertCmd.Parameters.Add("?projectId", MySqlDbType.Int32).Value = projectId;
                mySqlInsertCmd.Parameters.Add("?name", MySqlDbType.VarString).Value = name;

                int totalRowsAdded = await mySqlInsertCmd.ExecuteNonQueryAsync();

                return totalRowsAdded == 1;
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return false;
        }

        public async Task<List<Sprint>> GetSprintsByProjectId(int projectId)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            List<Sprint> sprintList = new List<Sprint>();

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlSelectCmd = new MySqlCommand("SELECT id, project_id, name FROM sprint WHERE project_id = ?projectId;", dbConn);
                mySqlSelectCmd.Parameters.Add("?projectId", MySqlDbType.Int32).Value = projectId;

                await mySqlSelectCmd.ExecuteNonQueryAsync();

                ProjectDao projectDao = new ProjectDao(_dbConnCtx, _logger);
                DbDataReader resultReader = await mySqlSelectCmd.ExecuteReaderAsync();

                while (await resultReader.ReadAsync())
                {
                    int sprintId = resultReader.GetInt32(0);
                    string sprintName = resultReader.GetString(2);
                    Project? project = await projectDao.GetProjectById(projectId);
                    List<ProjectTask> sprintUserStories = await GetSprintUserStories(sprintId);
                    
                    Sprint sprint = new Sprint(sprintId, project, sprintName, sprintUserStories);

                    sprintList.Add(sprint);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return sprintList;
        }

        public async Task<List<ProjectTask>> GetSprintUserStories(int sprintId)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            List<ProjectTask> userStories = new List<ProjectTask>();

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlSelectCmd = new MySqlCommand("SELECT sus.id, pb.title, pb.description FROM sprint_user_story sus INNER JOIN product_backlog pb WHERE sus.product_backlog_id = pb.id AND sus.sprint_id = ?sprintId;", dbConn);
                mySqlSelectCmd.Parameters.Add("?sprintId", MySqlDbType.Int32).Value = sprintId;

                await mySqlSelectCmd.ExecuteNonQueryAsync();

                ProjectSubtaskDao projectSubtaskDao = new ProjectSubtaskDao(_dbConnCtx, _logger);
                DbDataReader resultReader = await mySqlSelectCmd.ExecuteReaderAsync();

                while (await resultReader.ReadAsync())
                {
                    int userStoryId = resultReader.GetInt32(0);
                    string userStoryTitle = resultReader.GetString(1);
                    string userStoryDescription = resultReader.GetString(2);
                    List<ProjectSubtask>? subtasks = await projectSubtaskDao.GetUserStorySubtaskList(userStoryId);

                    // TODO: Replace this after the Product Backlog task is completed
                    ProjectTask projectTask = new ProjectTask(userStoryId, userStoryTitle, userStoryDescription, 1, 1, 1234.0m, subtasks);

                    userStories.Add(projectTask);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            userStories = userStories.OrderBy(sprint => sprint.Priority).ToList();

            return userStories;
        }

        public async Task<bool> DeleteSprintById(int sprintId)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();
            
            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlDeleteCmd = new MySqlCommand("DELETE FROM sprint WHERE id = ?sprintId;", dbConn);
                mySqlDeleteCmd.Parameters.Add("?sprintId", MySqlDbType.Int32).Value = sprintId;

                int totalRowsDeleted = await mySqlDeleteCmd.ExecuteNonQueryAsync();

                return totalRowsDeleted >= 1;
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return false;
        }
    }
}
