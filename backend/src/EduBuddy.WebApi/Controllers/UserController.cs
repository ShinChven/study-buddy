using System.Security.Claims;
using EduBuddy.Domain.Entities;
using EduBuddy.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduBuddy.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly EduBuddyDbContext _context;

    public UserController(UserManager<User> userManager, EduBuddyDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetUserId();
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return NotFound();

        return Ok(new
        {
            user.Email,
            user.DisplayName,
            user.AvatarUrl,
            user.Preferences
        });
    }

    [HttpPatch("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = GetUserId();
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return NotFound();

        if (request.DisplayName != null) user.DisplayName = request.DisplayName;
        if (request.AvatarUrl != null) user.AvatarUrl = request.AvatarUrl;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded) return BadRequest(result.Errors);

        return Ok(user);
    }

    [HttpPatch("preferences")]
    public async Task<IActionResult> UpdatePreferences([FromBody] UserPreferences preferences)
    {
        var userId = GetUserId();
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return NotFound();

        user.Preferences = preferences;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded) return BadRequest(result.Errors);

        return Ok(user.Preferences);
    }

    private Guid GetUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(userIdString!);
    }
}

public class UpdateProfileRequest
{
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
}
