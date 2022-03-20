using MySql.Data.MySqlClient;

namespace SprintCompassBackend.DataAccessLayer
{
    public class DatabaseConnectionContext
    {
        private readonly string _connectionString;

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
