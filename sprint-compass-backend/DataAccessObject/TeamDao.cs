using MySql.Data.MySqlClient;
using SprintCompassBackend.DataAccessLayer;
using SprintCompassBackend.Entities;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Threading.Tasks;

namespace SprintCompassBackend.DataAccessObject
{
    public class TeamDao
    {
        private DatabaseConnectionContext _dbConnCtx;

        public TeamDao(DatabaseConnectionContext dbConnCtx)
        {
            _dbConnCtx = dbConnCtx;
        }

        public async Task<bool> AddTeam(string teamName)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> AddMemberToTeam(int userId)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> RemoveMemberFromTeam(int userId)
        {
            throw new NotImplementedException();
        }

        public async Task<List<Team>> GetTeams()
        {
            List<Team> teamList = new List<Team>();
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlSelectCmd = new MySqlCommand();

                mySqlSelectCmd.Connection = dbConn;
                mySqlSelectCmd.CommandText = "SELECT id, name FROM team;";
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
            catch (Exception)
            {
                // TODO: Log exception
            }

            return teamList;
        }

        public async Task<Team> GetTeamById(int teamId)
        {
            Team team = null;
            using MySqlConnection dbConn = _dbConnCtx.GetConnection();

            try
            {
                await dbConn.OpenAsync();

                using MySqlCommand mySqlSelectCmd = new MySqlCommand();

                mySqlSelectCmd.Connection = dbConn;
                mySqlSelectCmd.CommandText = "SELECT id, name FROM team WHERE id = ?teamId;";
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
            catch (Exception)
            {
                // TODO: Log exception
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

                using MySqlCommand mySqlSelectCmd = new MySqlCommand();

                mySqlSelectCmd.Connection = dbConn;
                mySqlSelectCmd.CommandText = "SELECT tml.id, tml.team_id, tml.user_id, tml.role_id, user.first_name, user.last_name FROM team_member_list tml INNER JOIN user ON user.id = user_id WHERE team_id = ?teamId;";
                mySqlSelectCmd.Parameters.Add("?teamId", MySqlDbType.Int32).Value = teamId;
                await mySqlSelectCmd.ExecuteNonQueryAsync();

                DbDataReader resultReader = await mySqlSelectCmd.ExecuteReaderAsync();

                // Read over every row
                while (await resultReader.ReadAsync())
                {
                    int userId = resultReader.GetInt32(2);
                    int roleId = resultReader.GetInt32(3);
                    string firstName = resultReader.GetString(4);
                    string lastName = resultReader.GetString(5);

                    teamMemberList.Add(new TeamMember(userId, firstName, lastName, roleId));
                }
            }
            catch (Exception ex)
            {
                // TODO: Log exception
            }

            return teamMemberList;
        }
    }
}
