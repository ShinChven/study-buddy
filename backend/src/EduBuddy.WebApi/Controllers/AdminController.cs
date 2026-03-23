using System.Security.Claims;
using EduBuddy.Application.DTOs;
using EduBuddy.Application.Interfaces;
using EduBuddy.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduBuddy.WebApi.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly ISystemSettingsService _settingsService;
    private readonly UserManager<User> _userManager;

    public AdminController(ISystemSettingsService settingsService, UserManager<User> userManager)
    {
        _settingsService = settingsService;
        _userManager = userManager;
    }

    [HttpGet("settings/{key}")]
    public async Task<IActionResult> GetSetting(string key)
    {
        var value = await _settingsService.GetSettingAsync(key);
        
        // Never return sensitive keys to the browser
        if (key.Contains("ApiKey", StringComparison.OrdinalIgnoreCase))
        {
            return Ok(new { 
                key, 
                value = string.IsNullOrEmpty(value) ? null : "[SET]",
                isSet = !string.IsNullOrEmpty(value) 
            });
        }
        
        return Ok(new { key, value });
    }

    [HttpPost("settings")]
    public async Task<IActionResult> UpdateSetting([FromBody] UpdateSettingRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var userId = Guid.Parse(userIdString!);
        
        await _settingsService.SetSettingAsync(request.Key, request.Value, userId);
        return Ok();
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _userManager.Users
            .Select(u => new { u.Id, u.Email, u.DisplayName, u.CreatedAt })
            .ToListAsync();
        return Ok(users);
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] RegisterRequest request)
    {
        var user = new User
        {
            UserName = request.Email,
            Email = request.Email,
            DisplayName = request.DisplayName,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded) return BadRequest(result.Errors);

        return Ok(new { user.Id, user.Email, user.DisplayName });
    }
}

public class UpdateSettingRequest
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
