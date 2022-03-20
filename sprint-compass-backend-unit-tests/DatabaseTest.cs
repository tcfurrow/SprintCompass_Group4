using System;
using System.Collections.Generic;
using System.Linq;
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
            // Assert.Single(teamProjects);

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

        [Fact]
        public async void TestUpdateProject()
        {
            int teamId = 1;
            int projectIndex = 1;

            ProjectDao projectDao = new ProjectDao(new DatabaseConnectionContext(MySqlConnectionString));

            List<Project> teamProjectList = await projectDao.GetProjectsByTeamId(teamId);
            
            Project projectToUpdate = teamProjectList[projectIndex];
            projectToUpdate.Name = "StackOverflow";
            projectToUpdate.Description = "The best thing a programmer can have.";
            projectToUpdate.StartDate = DateTime.Now;

            bool projectUpdated = await projectDao.UpdateProject(projectToUpdate);

            Assert.True(projectUpdated);

            teamProjectList = await projectDao.GetProjectsByTeamId(teamId);

            Project updatedProject = teamProjectList[projectIndex];

            Assert.Equal(projectToUpdate.Name, updatedProject.Name);
            Assert.Equal(projectToUpdate.Description, updatedProject.Description);
            Assert.NotNull(projectToUpdate.StartDate);

            projectToUpdate.Name = "GitHub";
            projectToUpdate.Description = "The home of open-source software!";
            projectToUpdate.StartDate = null;

            projectUpdated = await projectDao.UpdateProject(projectToUpdate);

            Assert.True(projectUpdated);

            teamProjectList = await projectDao.GetProjectsByTeamId(teamId);
            updatedProject = teamProjectList[projectIndex];

            Assert.Equal(projectToUpdate.Name, updatedProject.Name);
            Assert.Equal(projectToUpdate.Description, updatedProject.Description);
            Assert.Null(projectToUpdate.StartDate);
        }

        [Fact]
        public async void TestGetProductBacklog()
        {
            int projectId = 1;

            ProjectDao projectDao = new ProjectDao(new DatabaseConnectionContext(MySqlConnectionString));
            List<ProjectTask> productBacklog = await projectDao.GetProductBacklog(projectId);

            ProjectTask firstTask = productBacklog[0];
            ProjectTask secondTask = productBacklog[1];

            Assert.Equal("Capture/Maintain basic project information", firstTask.Title);
            Assert.Equal("Facilitate information collection", firstTask.Description);
            Assert.Equal(1, firstTask.Priority);
            Assert.Equal(8, firstTask.RelativeEstimate);
            Assert.Equal(1040m, firstTask.Cost);

            Assert.Equal("Maintain a list of team members assigned to the project", secondTask.Title);
            Assert.Equal("Track estimated and actual times for each team member", secondTask.Description);
            Assert.Equal(2, secondTask.Priority);
            Assert.Equal(1, secondTask.RelativeEstimate);
            Assert.Equal(130m, secondTask.Cost);
        }

        [Fact]
        public async void TestAddProjectTaskToProductBacklog()
        {
            ProjectDao projectDao = new ProjectDao(new DatabaseConnectionContext(MySqlConnectionString));

            int projectId = 1;
            string title = "Capture/Maintain the product backlog including relative estimates(and estimated costs)";
            string description = "Establish a benchmark for comparison purposes.";
            int priority = 3;
            int relativeEstimate = 5;
            decimal cost = 650m;

            ProjectTask projectTask = await projectDao.AddProjectTask(projectId, title, description, priority, relativeEstimate, cost);

            Assert.NotNull(projectTask);
            Assert.Equal(title, projectTask.Title);
            Assert.Equal(description, projectTask.Description);
            Assert.Equal(priority, projectTask.Priority);
            Assert.Equal(cost, projectTask.Cost);
        }

        [Fact]
        public async void TestCalculatedEstimateValues()
        {
            int teamId = 1;

            ProjectDao projectDao = new ProjectDao(new DatabaseConnectionContext(MySqlConnectionString));
            List<Project> teamProjects = await projectDao.GetProjectsByTeamId(teamId);

            Project sprintCompassProject = teamProjects.FirstOrDefault(proj => proj.Name == "SprintCompass");

            Assert.NotNull(sprintCompassProject);
            Assert.True(sprintCompassProject.StoryPointsEstimateTotal > 0);
            Assert.True(sprintCompassProject.EstimatedCostTotal > 0.0m);
        }
    }
}
