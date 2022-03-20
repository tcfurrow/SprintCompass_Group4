using MySql.Data.MySqlClient;
using SprintCompassBackend.DataAccessLayer;
using SprintCompassBackend.Entities;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Threading.Tasks;
using System.Linq;

#nullable enable

namespace SprintCompassBackend.DataAccessObject
{
    public class ProjectDao
    {
        private DatabaseConnectionContext _dbConnCtx;

        public ProjectDao(DatabaseConnectionContext dbConnCtx)
        {
            _dbConnCtx = dbConnCtx;
        }

        public async Task<Project?> AddProject(string name, string description, int teamId)
        {
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            TeamDao teamDao = new TeamDao(_dbConnCtx);
            Project? addedProject = null;
            Team team = await teamDao.GetTeamById(teamId);

            if (team is not null)
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlInsertCmd = new MySqlCommand("INSERT INTO project (name, description, team_id, start_date) VALUES (?name, ?description, ?teamId, NULL);", dbConn);
                mySqlInsertCmd.Parameters.Add("?name", MySqlDbType.VarString).Value = name;
                mySqlInsertCmd.Parameters.Add("?description", MySqlDbType.VarString).Value = description;
                mySqlInsertCmd.Parameters.Add("?teamId", MySqlDbType.Int32).Value = teamId;

                int rowsAdded = await mySqlInsertCmd.ExecuteNonQueryAsync();

                if (rowsAdded == 1)
                {
                    List<Project> teamProjects = await GetProjectsByTeamId(teamId);
                    addedProject = teamProjects.LastOrDefault();
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
                catch (Exception)
                {
                    // TODO: Log exception
                }
            }

            return projectUpdated;
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
                // TODO: Log exception
            }

            return teamProjectList;
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
            catch (Exception)
            {
                // TODO: Log exception
            }

            return projectTasks;
        }
    }
}
