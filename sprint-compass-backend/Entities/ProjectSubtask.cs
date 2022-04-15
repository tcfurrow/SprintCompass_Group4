namespace SprintCompassBackend.Entities
{
    public class ProjectSubtask
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public TeamMember? AssignedTo { get; set; }
        public SubtaskStatus Status { get; set; }
        public double TotalHoursWorked { get; set; }

        public ProjectSubtask(int id, string title, TeamMember? assignedTo, SubtaskStatus status, double totalHoursWorked)
        {
            Id = id;
            Title = title;
            AssignedTo = assignedTo;
            Status = status;
            TotalHoursWorked = totalHoursWorked;
        }
    }
}
