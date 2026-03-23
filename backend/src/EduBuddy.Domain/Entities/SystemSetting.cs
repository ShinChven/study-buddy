using System;

namespace EduBuddy.Domain.Entities;

public class SystemSetting
{
    public string Key { get; set; } = string.Empty; // Primary Key
    public string Value { get; set; } = string.Empty;
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    public Guid? UpdatedBy { get; set; }

    public virtual User? UpdatedByUser { get; set; }
}
