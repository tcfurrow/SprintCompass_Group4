// File Name:    Team.cs
// By:           Darian Benam, Jordan Fox, and Teresa Furrow

using System.Collections.Generic;

namespace SprintCompassBackend.Entities
{
    public class Team
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<TeamMember> Members { get; set; }

        public Team(int id, string name, List<TeamMember> members)
        {
            Id = id;
            Name = name;
            Members = members;
        }
    }
}
