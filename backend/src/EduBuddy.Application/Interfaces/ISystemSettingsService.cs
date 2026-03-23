using System.Threading.Tasks;

namespace EduBuddy.Application.Interfaces;

public interface ISystemSettingsService
{
    Task<string?> GetSettingAsync(string key);
    Task SetSettingAsync(string key, string value, Guid? userId = null);
}
