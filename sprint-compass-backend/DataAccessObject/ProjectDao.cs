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
    public class ProjectDao
    {
        private DatabaseConnectionContext _dbConnCtx;
        private ILogger? _logger;

        public ProjectDao(DatabaseConnectionContext dbConnCtx, ILogger? logger = null)
        {
            _dbConnCtx = dbConnCtx;
            _logger = logger;
        }

        public async Task<Project?> AddProject(string name, string description, int teamId)
        {
            if (teamId == -1)
            {
                return null;
            }

            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            TeamDao teamDao = new TeamDao(_dbConnCtx);
            Project? addedProject = null;
            Team? team = await teamDao.GetTeamById(teamId);

            if (team is not null)
            {
                try
                {
                    await dbConn.OpenAsync();

                    using MySqlCommand mySqlInsertCmd = new MySqlCommand("INSERT INTO project (name, description, team_id, start_date) VALUES (?name, ?description, ?teamId, NULL);", dbConn);
                    mySqlInsertCmd.Parameters.Add("?name", MySqlDbType.VarString).Value = name;
                    mySqlInsertCmd.Parameters.Add("?description", MySqlDbType.VarString).Value = description;
                    mySqlInsertCmd.Parameters.Add("?teamId", MySqlDbType.Int32).Value = teamId;

                    int totalRowsAdded = await mySqlInsertCmd.ExecuteNonQueryAsync();

                    if (totalRowsAdded == 1)
                    {
                        List<Project> teamProjects = await GetProjectsByTeamId(teamId);
                        addedProject = teamProjects.LastOrDefault();
                    }
                }
                catch (Exception ex)
                {
                    _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
                }
            }

            return addedProject;
        }

        public async Task<bool> UpdateProject(Project project)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();
            bool projectUpdated = false;

            if (project.Id > 0 && project.Team is not null)
            {
                try
                {
                    await dbConn.OpenAsync();

                    using MySqlCommand mySqlUpdateCmd = new MySqlCommand("UPDATE project SET name = ?name, description = ?description, team_id = ?teamId, start_date = ?startDate WHERE id = ?projectId;", dbConn);
                    mySqlUpdateCmd.Parameters.Add("?name", MySqlDbType.VarString).Value = project.Name;
                    mySqlUpdateCmd.Parameters.Add("?description", MySqlDbType.VarString).Value = project.Description;
                    mySqlUpdateCmd.Parameters.Add("?teamId", MySqlDbType.Int32).Value = project.Team.Id;
                    mySqlUpdateCmd.Parameters.Add("?startDate", MySqlDbType.DateTime).Value = project.StartDate ?? DBNull.Value as object;
                    mySqlUpdateCmd.Parameters.Add("?projectId", MySqlDbType.Int32).Value = project.Id;

                    int rowsUpdated = await mySqlUpdateCmd.ExecuteNonQueryAsync();
                    projectUpdated = rowsUpdated > 0;
                }
                catch (Exception ex)
                {
                    _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
                }
            }

            return projectUpdated;
        }

        public async Task<bool> DeleteProject(int projectId)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();
            bool projectDeleted = false;

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlUpdateCmd = new MySqlCommand("DELETE FROM project WHERE id = ?projectId;", dbConn);
                mySqlUpdateCmd.Parameters.Add("?projectId", MySqlDbType.Int32).Value = projectId;

                int numberOfRowsDeleted = await mySqlUpdateCmd.ExecuteNonQueryAsync();
                projectDeleted = numberOfRowsDeleted > 0;
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return projectDeleted;
        }

        public async Task<Project?> GetProjectById(int projectId)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            Project? project = null;

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlSelectCmd = new MySqlCommand("SELECT id, name, description, team_id, start_date FROM project WHERE id = ?projectId;", dbConn);
                mySqlSelectCmd.Parameters.Add("?projectId", MySqlDbType.Int32).Value = projectId;

                await mySqlSelectCmd.ExecuteNonQueryAsync();

                DbDataReader resultReader = await mySqlSelectCmd.ExecuteReaderAsync();

                if (resultReader.HasRows)
                {
                    TeamDao teamDao = new TeamDao(_dbConnCtx);

                    await resultReader.ReadAsync();

                    string projectName = resultReader.GetString(1);
                    string projectDescription = resultReader.GetString(2);
                    int projectTeamOwnerId = resultReader.GetInt32(3);
                    DateTime? startDate = null;
                    List<ProjectTask> productBacklog = await GetProductBacklog(projectId);

                    // Get the start date if it is not null
                    if (!await resultReader.IsDBNullAsync(4))
                    {
                        startDate = resultReader.GetDateTime(4);
                    }

                    Team? projectTeamOwner = await teamDao.GetTeamById(projectTeamOwnerId);

                    project = new Project(projectId, projectName, projectDescription, projectTeamOwner, startDate, productBacklog);
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return project;
        }

        public async Task<List<Project>> GetProjectsByTeamId(int teamId)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            List<Project> teamProjectList = new List<Project>();
            Team? projectTeamOwner = null;

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlSelectCmd = new MySqlCommand("SELECT id, name, description, team_id, start_date FROM project WHERE team_id = ?teamId;", dbConn);
                mySqlSelectCmd.Parameters.Add("?teamId", MySqlDbType.Int32).Value = teamId;

                await mySqlSelectCmd.ExecuteNonQueryAsync();

                DbDataReader resultReader = await mySqlSelectCmd.ExecuteReaderAsync();

                // Read over every row
                while (await resultReader.ReadAsync())
                {
                    int projectId = resultReader.GetInt32(0);
                    string projectName = resultReader.GetString(1);
                    string projectDescription = resultReader.GetString(2);
                    int projectTeamOwnerId = resultReader.GetInt32(3);
                    DateTime? startDate = null;
                    List<ProjectTask> productBacklog = await GetProductBacklog(projectId);

                    // Get the start date if it is not null
                    if (!await resultReader.IsDBNullAsync(4))
                    {
                        startDate = resultReader.GetDateTime(4);
                    }

                    if (projectTeamOwner is null)
                    {
                        TeamDao teamDao = new TeamDao(_dbConnCtx);
                        projectTeamOwner = await teamDao.GetTeamById(projectTeamOwnerId);
                    }

                    teamProjectList.Add(new Project(projectId, projectName, projectDescription, projectTeamOwner, startDate, productBacklog));
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return teamProjectList;
        }

        public async Task<ProjectTask?> AddProjectTask(int projectId, string title, string description, int priority, int relativeEstimate, decimal cost)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            ProjectTask? addedProjectTask = null;

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
                    List<ProjectTask> projectProductBacklog = await GetProductBacklog(projectId);
                    addedProjectTask = projectProductBacklog.LastOrDefault();
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return addedProjectTask;
        }

        public async Task<List<ProjectTask>> GetProductBacklog(int projectId)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            List<ProjectTask> projectTasks = new List<ProjectTask>();

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

                    projectTasks.Add(new ProjectTask(taskId, title, description, priority, relativeEstimate, cost));
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError("An error occurred in {0}: {1}", MethodBase.GetCurrentMethod()?.Name, ex.Message);
            }

            return projectTasks;
        }
    }
}
