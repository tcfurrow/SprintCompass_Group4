// File Name:    ProductBacklogTask.cs
// By:           Darian Benam, Jordan Fox, and Teresa Furrow

namespace SprintCompassBackend.Entities
{
    public class ProductBacklogTask
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int Priority { get; set; }
        public int RelativeEstimate { get; set; }
        public decimal Cost { get; set; }

        public ProductBacklogTask(int id,
                                  string title,
                                  string description,
                                  int priority,
                                  int relativeEstimate,
                                  decimal cost)
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
