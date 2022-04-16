// File Name:    ProjectTask.cs
// By:           Darian Benam, Jordan Fox, and Teresa Furrow

using System.Collections.Generic;

namespace SprintCompassBackend.Entities
{
    public class ProjectTask
    {
        public int Id { get; set; }

        public int SprintId { get; set; }

        public ProductBacklogTask? ParentProductBacklogTask { get; set; }

        public List<ProjectSubtask> Subtasks { get; set; }

        public ProjectTask(int id,
                           int sprintId,
                           ProductBacklogTask? parentProductBacklogTask,
                           List<ProjectSubtask>? subtasks = null)
        {
            Id = id;
            SprintId = sprintId;
            ParentProductBacklogTask = parentProductBacklogTask;
            Subtasks = subtasks ?? new List<ProjectSubtask>();
        }
    }
}
