using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace EduBuddy.Domain.Entities;

public class User : IdentityUser<Guid>
{
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
    public UserPreferences Preferences { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual ICollection<Conversation> Conversations { get; set; } = new List<Conversation>();
}

public class UserPreferences
{
    public string AccentColor { get; set; } = "indigo";
    public bool IsDarkMode { get; set; } = false;
}
