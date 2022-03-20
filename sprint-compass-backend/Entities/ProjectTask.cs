﻿namespace SprintCompassBackend.Entities
{
    public class ProjectTask
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int Priority { get; set; }
        public int RelativeEstimate { get; set; }
        public decimal Cost { get; set; }

        public ProjectTask(int id, string title, string description, int priority, int relativeEstimate, decimal cost)
        {
            Id = id;
            Title = title;
            Description = description;
            Priority = priority;
            RelativeEstimate = relativeEstimate;
            Cost = cost;
        }
    }
}