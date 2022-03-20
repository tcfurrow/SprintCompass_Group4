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

                    teamProjectList.Add(new Project(projectId, projectName, projectDescription, projectTeamOwner, startDate));
                }
            }
            catch (Exception ex)
            {
                // TODO: Log exception
            }

            return teamProjectList;
        }
    }
}
