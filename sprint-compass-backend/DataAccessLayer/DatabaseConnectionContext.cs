using MySql.Data.MySqlClient;

namespace SprintCompassBackend
{
    public class DatabaseConnectionContext
    {
        private string _connectionString;

        public DatabaseConnectionContext(string connectionString)
        {
            _connectionString = connectionString;
        }

        public MySqlConnection GetConnection()
        {
            return new MySqlConnection(_connectionString);
        }
    }
}
