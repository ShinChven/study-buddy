using System.Security.Claims;
using EduBuddy.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduBuddy.WebApi.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly ISystemSettingsService _settingsService;

    public AdminController(ISystemSettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    [HttpGet("settings/{key}")]
    public async Task<IActionResult> GetSetting(string key)
    {
        var value = await _settingsService.GetSettingAsync(key);
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
}

public class UpdateSettingRequest
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
