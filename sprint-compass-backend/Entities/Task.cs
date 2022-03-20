namespace SprintCompassBackend.Entities
{
    public class Task
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int RelativeEstimate { get; set; }
        public decimal Cost { get; set; }
    }
}
