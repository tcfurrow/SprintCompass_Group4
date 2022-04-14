// File Name:    BacklogDao.cs
// By:           Darian Benam, Jordan Fox, and Teresa Furrow

using MySql.Data.MySqlClient;
using SprintCompassBackend.DataAccessLayer;
using SprintCompassBackend.Entities;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.Extensions.Logging;
using System.Reflection;

#nullable enable

namespace SprintCompassBackend.DataAccessObject
{
    public class BacklogDao
    {
        private DatabaseConnectionContext _dbConnCtx;
        private ILogger? _logger;

        public BacklogDao(DatabaseConnectionContext dbConnCtx, ILogger? logger = null)
        {
            _dbConnCtx = dbConnCtx;
            _logger = logger;
        }

        public async Task<ProductBacklogTask?> AddProjectTask(int projectId, string title, string description, int priority, int relativeEstimate, decimal cost)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            ProductBacklogTask? addedProjectTask = null;

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlInsertCmd = new MySqlCommand("INSERT INTO product_backlog (project_id, title, description, priority, relative_estimate, cost) VALUES (?projectId, ?title, ?description, ?priority, ?relativeEstimate, ?cost);", dbConn);
                mySqlInsertCmd.Parameters.Add("?projectId", MySqlDbType.Int32).Value = projectId;
                mySqlInsertCmd.Parameters.Add("?title", MySqlDbType.VarString).Value = title;
                mySqlInsertCmd.Parameters.Add("?description", MySqlDbType.VarString).Value = description;
                mySqlInsertCmd.Parameters.Add("?priority", MySqlDbType.Int32).Value = priority;
                mySqlInsertCmd.Parameters.Add("?relativeEstimate", MySqlDbType.Int32).Value = relativeEstimate;
                mySqlInsertCmd.Parameters.Add("?cost", MySqlDbType.Decimal).Value = cost;

                int totalRowsAdded = await mySqlInsertCmd.ExecuteNonQueryAsync();

                if (totalRowsAdded == 1)
                {
                    List<ProductBacklogTask> projectProductBacklog = await GetProductBacklog(projectId);
                    addedProjectTask = projectProductBacklog.LastOrDefault();
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return addedProjectTask;
        }

        public async Task<List<ProductBacklogTask>> GetProductBacklog(int projectId)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            List<ProductBacklogTask> projectTasks = new List<ProductBacklogTask>();

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlSelectCmd = new MySqlCommand("SELECT id, project_id, title, description, priority, relative_estimate, cost FROM product_backlog WHERE project_id = ?projectId;", dbConn);
                mySqlSelectCmd.Parameters.Add("?projectId", MySqlDbType.Int32).Value = projectId;

                await mySqlSelectCmd.ExecuteNonQueryAsync();

                DbDataReader resultReader = await mySqlSelectCmd.ExecuteReaderAsync();

                // Read over every row
                while (await resultReader.ReadAsync())
                {
                    int taskId = resultReader.GetInt32(0);
                    string title = resultReader.GetString(2);
                    string description = resultReader.GetString(3);
                    int priority = resultReader.GetInt32(4);
                    int relativeEstimate = resultReader.GetInt32(5);
                    decimal cost = resultReader.GetDecimal(6);

                    projectTasks.Add(new ProductBacklogTask(taskId, title, description, priority, relativeEstimate, cost));
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return projectTasks;
        }

        public async Task<ProductBacklogTask?> GetProductBacklogTaskById(int productBacklogId)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlSelectCmd = new MySqlCommand("SELECT id, project_id, title, description, priority, relative_estimate, cost FROM product_backlog WHERE id = ?productBacklogId;", dbConn);
                mySqlSelectCmd.Parameters.Add("?productBacklogId", MySqlDbType.Int32).Value = productBacklogId;

                await mySqlSelectCmd.ExecuteNonQueryAsync();
                
                DbDataReader resultReader = await mySqlSelectCmd.ExecuteReaderAsync();

                if (resultReader.HasRows)
                {
                    await resultReader.ReadAsync();

                    string title = resultReader.GetString(2);
                    string description = resultReader.GetString(3);
                    int priority = resultReader.GetInt32(4);
                    int relativeEstimate = resultReader.GetInt32(5);
                    decimal cost = resultReader.GetDecimal(6);

                    return new ProductBacklogTask(productBacklogId, title, description, priority, relativeEstimate, cost);
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
