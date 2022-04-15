using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SprintCompassBackend.Entities
{
    public class Sprint
    {
        public int Id { get; set; }
        public Project? Project { get; set; }
        public string Name { get; set; }
        public List<ProjectTask> UserStories { get; set; }

        public Sprint(int id, Project? project, string name, List<ProjectTask> userStories)
        {
            Id = id;
            Project = project;
            Name = name;
            UserStories = userStories;
        }
    }
}
