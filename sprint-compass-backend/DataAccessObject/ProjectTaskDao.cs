// File Name:    ProjectTaskDao.cs
// By:           Darian Benam, Jordan Fox, and Teresa Furrow

using Microsoft.Extensions.Logging;
using MySql.Data.MySqlClient;
using SprintCompassBackend.DataAccessLayer;
using SprintCompassBackend.Entities;
using System;
using System.Reflection;
using System.Threading.Tasks;

namespace SprintCompassBackend.DataAccessObject
{
    public class ProjectTaskDao
    {
        private DatabaseConnectionContext _dbConnCtx;
        private ILogger? _logger;

        public ProjectTaskDao(DatabaseConnectionContext dbConnCtx, ILogger? logger = null)
        {
            _dbConnCtx = dbConnCtx;
            _logger = logger;

            _logger?.LogInformation("A {0} instance has been created!", "ProjectSubtaskDao");
        }

        // NOTE: This method does not check if the sprint id or product backlog id exist in the database. In the future, it would be
        //       be better to check if these exists before inserting.
        public async Task<ProjectTask?> CreateProjectTask(int sprintId, int productBacklogId)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlInsertCmd = new MySqlCommand("INSERT INTO sprint_user_story (sprint_id, product_backlog_id) VALUES (?sprintId, ?productBacklogId);", dbConn);
                mySqlInsertCmd.Parameters.Add("?sprintId", MySqlDbType.Int32).Value = sprintId;
                mySqlInsertCmd.Parameters.Add("?productBacklogId", MySqlDbType.Int32).Value = productBacklogId;

                int rowsInserted = await mySqlInsertCmd.ExecuteNonQueryAsync();

                if (rowsInserted == 1)
                {
                    int projectTaskId = (int)mySqlInsertCmd.LastInsertedId;

                    BacklogDao backlogDao = new BacklogDao(_dbConnCtx, _logger);
                    ProductBacklogTask? productBacklogTask = await backlogDao.GetProductBacklogTaskById(productBacklogId);

                    return new ProjectTask(projectTaskId, sprintId, productBacklogTask);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return null;
        }

        public async Task<bool> DeleteProjectTask(int projectTaskId)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlDeleteCmd = new MySqlCommand("DELETE sus, subtask FROM sprint_user_story sus LEFT JOIN sprint_user_story_subtask subtask ON subtask.sprint_user_story_id = sus.id WHERE sus.id = ?projectTaskId;", dbConn);
                mySqlDeleteCmd.Parameters.Add("?projectTaskId", MySqlDbType.Int32).Value = projectTaskId;

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
