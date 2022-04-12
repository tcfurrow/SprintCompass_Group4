namespace SprintCompassBackend.Entities
{
    public class ProjectSubtask
    {
        public int Id { get; set; }
        public ProjectTask ParentTask { get; set; }
        public string Title { get; set; }
        public SubtaskStatus Status { get; set; }

        public ProjectSubtask(int id, ProjectTask parentTask, string title, SubtaskStatus status)
        {
            Id = id;
            ParentTask = parentTask;
            Title = title;
            Status = status; 
        }
    }
}
