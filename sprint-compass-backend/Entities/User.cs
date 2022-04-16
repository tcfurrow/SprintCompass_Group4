// File Name:    User.cs
// By:           Darian Benam, Jordan Fox, and Teresa Furrow

namespace SprintCompassBackend.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }

        public User(int id, string firstName, string lastName)
        {
            Id = id;
            FirstName = firstName;
            LastName = lastName;
        }
    }
}
