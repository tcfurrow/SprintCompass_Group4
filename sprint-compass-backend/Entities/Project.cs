using System;
using System.Collections.Generic;

#nullable enable

namespace SprintCompassBackend.Entities
{
    public class Project
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Team? Team { get; set; }
        public DateTime? StartDate { get; set; }
        public List<ProjectTask> ProductBacklog { get; set; }

        public Project(int id, string name, string description, Team? team, DateTime? startDate, List<ProjectTask> productBacklog)
        {
            Id = id;
            Name = name;
            Description = description;
            Team = team;
            StartDate = startDate;
            ProductBacklog = productBacklog;
        }
    }
}
