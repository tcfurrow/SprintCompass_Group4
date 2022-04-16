// File Name:    ProjectSubtask.cs
// By:           Darian Benam, Jordan Fox, and Teresa Furrow

namespace SprintCompassBackend.Entities
{
    public class ProjectSubtask
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public TeamMember? AssignedTo { get; set; }
        public SubtaskStatus Status { get; set; }
        public double TotalHoursWorked { get; set; }
        public double HoursReestimate { get; set; }

        public ProjectSubtask(int id, string title, TeamMember? assignedTo, SubtaskStatus status, double totalHoursWorked, double hoursReestimate)
        {
            Id = id;
            Title = title;
            AssignedTo = assignedTo;
            Status = status;
            TotalHoursWorked = totalHoursWorked;
            HoursReestimate = hoursReestimate;
        }
    }
}
