using System.Threading.Tasks;
using EduBuddy.Application.DTOs;

namespace EduBuddy.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse?> LoginAsync(LoginRequest request);
    Task<AuthResponse?> RegisterAsync(RegisterRequest request);
}
