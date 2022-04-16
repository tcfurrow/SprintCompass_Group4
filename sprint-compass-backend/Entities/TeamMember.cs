// File Name:    TeamMember.cs
// By:           Darian Benam, Jordan Fox, and Teresa Furrow

using System;

namespace SprintCompassBackend.Entities
{
    public class TeamMember
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }

        private int _roleId = -1;
        public Role Role
        {
            get => _roleId switch
            {
                1 => Role.TeamMember,
                2 => Role.ProjectManager,
                _ => throw new Exception("Unsupported role id!")
            };
        }

        public TeamMember(int id, string firstName, string lastName, int roleId)
        {
            Id = id;
            FirstName = firstName;
            LastName = lastName;
            _roleId = roleId;
        }
    }
}
