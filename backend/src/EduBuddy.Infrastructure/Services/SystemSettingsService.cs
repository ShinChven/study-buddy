using System;
using System.Threading.Tasks;
using EduBuddy.Application.Interfaces;
using EduBuddy.Domain.Entities;
using EduBuddy.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EduBuddy.Infrastructure.Services;

public class SystemSettingsService : ISystemSettingsService
{
    private readonly EduBuddyDbContext _context;

    public byte[]? EncryptionKey { get; set; } // TODO: Implement encryption for values like API Keys

    public SystemSettingsService(EduBuddyDbContext context)
    {
        _context = context;
    }

    public async Task<string?> GetSettingAsync(string key)
    {
        var setting = await _context.SystemSettings.FindAsync(key);
        return setting?.Value;
    }

    public async Task SetSettingAsync(string key, string value, Guid? userId = null)
    {
        var setting = await _context.SystemSettings.FindAsync(key);
        if (setting == null)
        {
            setting = new SystemSetting
            {
                Key = key,
                Value = value,
                LastUpdated = DateTime.UtcNow,
                UpdatedBy = userId
            };
            _context.SystemSettings.Add(setting);
        }
        else
        {
            setting.Value = value;
            setting.LastUpdated = DateTime.UtcNow;
            setting.UpdatedBy = userId;
        }

        await _context.SaveChangesAsync();
    }
}
