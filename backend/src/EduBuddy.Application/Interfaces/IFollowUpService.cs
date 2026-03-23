using System.Threading.Tasks;

namespace EduBuddy.Application.Interfaces;

public interface IFollowUpService
{
    Task<string?> GenerateFollowUpAsync(string assistantText);
}
