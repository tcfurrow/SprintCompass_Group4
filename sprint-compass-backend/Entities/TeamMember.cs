// File Name:    TeamMember.cs
// By:           Darian Benam, Jordan Fox, and Teresa Furrow

using System;

namespace SprintCompassBackend.Entities
{
    public class TeamMember
    {
        public int Id { get; set; }

        public User User { get; set; }

        private int _roleId = -1;
        public TeamMemberRole Role
        {
            get => _roleId switch
            {
                1 => TeamMemberRole.TeamMember,
                2 => TeamMemberRole.ProjectManager,
                _ => throw new Exception("Unsupported role id!")
            };
        }

        public TeamMember(int id, User user, int roleId)
        {
            Id = id;
            User = user;
            _roleId = roleId;
        }
    }
}
