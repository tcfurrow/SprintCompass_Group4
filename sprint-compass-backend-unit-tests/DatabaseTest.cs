using System;
using System.Collections.Generic;
using MySql.Data.MySqlClient;
using SprintCompassBackend.DataAccessLayer;
using SprintCompassBackend.DataAccessObject;
using SprintCompassBackend.Entities;
using Xunit;

namespace SprintCompassBackendUnitTests
{
    public class DatabaseTest
    {
        public const string MySqlConnectionString = "server=darianbenam.com;database=sprint_compass;uid=sprintcompass_admin;pwd=3q4S@B7D_s!uFv9;";

        [Fact]
        public void TestMySqlConnection()
        {
            using MySqlConnection dbConn = new DatabaseConnectionContext(MySqlConnectionString).GetConnection();
            bool connected;

            try
            {
                dbConn.Open();
                connected = true;
            }
            catch (Exception)
            {
                connected = false;
            }

            Assert.True(connected);
        }

        [Fact]
        public async void TestGetRoles()
        {
            RoleDao roleDao = new RoleDao(new DatabaseConnectionContext(MySqlConnectionString));
            List<string> roleList = await roleDao.GetRoles();

            Assert.Equal("TeamMember", roleList[0]);
            Assert.Equal("ProjectManager", roleList[1]);
        }

        [Fact]
        public async void TestGetTeamMembersByTeamId()
        {
            TeamDao teamDao = new TeamDao(new DatabaseConnectionContext(MySqlConnectionString));
            List<TeamMember> teamMembers = await teamDao.GetTeamMembersByTeamId(1);

            Assert.Equal(3, teamMembers.Count);
        }

        [Fact]
        public async void TestGetProjectsByTeamId()
        {
            ProjectDao projectDao = new ProjectDao(new DatabaseConnectionContext(MySqlConnectionString));
            List<Project> teamProjects = await projectDao.GetProjectsByTeamId(1);

            // Note from Darian: I only added one project to the team with the id if 1 in the
            // development database. If you add more projects to the team, comment out the line below.
            Assert.Single(teamProjects);

            Project firstProject = teamProjects[0];

            Assert.NotNull(firstProject.Team);
            Assert.Equal("SELECT group_name FROM group WHERE group_id = 4;", firstProject.Team.Name);
            Assert.Equal(1, firstProject.Team.Id);
            Assert.Equal("SprintCompass", firstProject.Name);
            Assert.Equal("Allows teams to track progress on projects.", firstProject.Description);
        }

        [Fact]
        public async void TestAddProject()
        {
            int teamId = 1;
            ProjectDao projectDao = new ProjectDao(new DatabaseConnectionContext(MySqlConnectionString));

            List<Project> initialTeamProjectsList = await projectDao.GetProjectsByTeamId(teamId);
            Project project = await projectDao.AddProject("GitHub", "The home of open-source software!", teamId);

            Assert.NotNull(project);

            List<Project> finalTeamProjectsList = await projectDao.GetProjectsByTeamId(project.Team.Id);

            Assert.Equal(initialTeamProjectsList.Count + 1, finalTeamProjectsList.Count);
        }
    }
}
