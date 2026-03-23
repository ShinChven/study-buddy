using EduBuddy.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace EduBuddy.Infrastructure.Persistence;

public class EduBuddyDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
    public EduBuddyDbContext(DbContextOptions<EduBuddyDbContext> options) : base(options)
    {
    }

    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Artifact> Artifacts => Set<Artifact>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<UsageLog> UsageLogs => Set<UsageLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // UsageLog relationships
        modelBuilder.Entity<UsageLog>(entity =>
        {
            entity.HasOne(l => l.User)
                .WithMany()
                .HasForeignKey(l => l.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // User Preferences as JSONB
        modelBuilder.Entity<User>(entity =>
        {
            entity.OwnsOne(u => u.Preferences, builder =>
            {
                builder.ToJson();
            });
        });

        // Conversation relationships
        modelBuilder.Entity<Conversation>(entity =>
        {
            entity.HasOne(c => c.User)
                .WithMany(u => u.Conversations)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Message relationships
        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasOne(m => m.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(m => m.ParentMessage)
                .WithMany(m => m.Children)
                .HasForeignKey(m => m.ParentMessageId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(m => m.Role)
                .HasConversion<string>();
        });

        // Artifact relationships
        modelBuilder.Entity<Artifact>(entity =>
        {
            entity.HasOne(a => a.Message)
                .WithMany(m => m.Artifacts)
                .HasForeignKey(a => a.MessageId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(a => a.Type)
                .HasConversion<string>();

            entity.Property(a => a.Data)
                .HasColumnType("jsonb");
        });

        // System Settings
        modelBuilder.Entity<SystemSetting>(entity =>
        {
            entity.HasKey(s => s.Key);
            
            entity.HasOne(s => s.UpdatedByUser)
                .WithMany()
                .HasForeignKey(s => s.UpdatedBy)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
