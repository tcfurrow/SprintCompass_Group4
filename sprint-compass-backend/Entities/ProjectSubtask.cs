namespace SprintCompassBackend.Entities
{
    public class ProjectSubtask
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public SubtaskStatus Status { get; set; }

        public ProjectSubtask(int id, string title, SubtaskStatus status)
        {
            Id = id;
            Title = title;
            Status = status; 
        }
    }
}
