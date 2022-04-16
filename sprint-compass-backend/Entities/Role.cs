// File Name:    Role.cs
// By:           Darian Benam, Jordan Fox, and Teresa Furrow

namespace SprintCompassBackend.Entities
{
    public class Role
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public Role(int id, string name)
        {
            Id = id;
            Name = name;
        }
    }
}
