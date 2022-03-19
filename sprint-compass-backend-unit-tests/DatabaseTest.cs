using System;
using MySql.Data.MySqlClient;
using SprintCompassBackend.DataAccessLayer;
using Xunit;

namespace sprint_compass_backend_unit_tests
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
    }
}
