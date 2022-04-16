// File Name:    Project.cs
// By:           Darian Benam, Jordan Fox, and Teresa Furrow

using System;
using System.Collections.Generic;
using System.Linq;

namespace SprintCompassBackend.Entities
{
    public class Project
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Team? Team { get; set; }
        public DateTime? StartDate { get; set; }
        public List<ProductBacklogTask> ProductBacklog { get; set; }

        public int StoryPointsEstimateTotal => ProductBacklog?.Sum(projTask => projTask.RelativeEstimate) ?? 0;

        public decimal EstimatedCostTotal => ProductBacklog?.Sum(projTask => projTask.Cost) ?? 0.0m;

        public Project(int id, string name, string description, Team? team, DateTime? startDate, List<ProductBacklogTask> productBacklog)
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
