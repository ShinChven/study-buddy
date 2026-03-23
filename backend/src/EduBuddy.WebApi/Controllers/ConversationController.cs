using System.Security.Claims;
using EduBuddy.Application.DTOs;
using EduBuddy.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduBuddy.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ConversationController : ControllerBase
{
    private readonly IConversationService _conversationService;

    public ConversationController(IConversationService conversationService)
    {
        _conversationService = conversationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetConversations()
    {
        var userId = GetUserId();
        var conversations = await _conversationService.GetUserConversationsAsync(userId);
        return Ok(conversations);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetConversation(Guid id)
    {
        var userId = GetUserId();
        var conversation = await _conversationService.GetConversationAsync(id, userId);
        if (conversation == null) return NotFound();
        return Ok(conversation);
    }

    [HttpGet("{id}/thread")]
    public async Task<IActionResult> GetThread(Guid id, [FromQuery] Guid? messageId = null)
    {
        var userId = GetUserId();
        var conversation = await _conversationService.GetConversationAsync(id, userId);
        if (conversation == null) return NotFound();

        var thread = await _conversationService.GetThreadAsync(id, messageId);
        var result = thread.Select(m => new
        {
            m.Id,
            m.ConversationId,
            Role = (int)m.Role,
            m.Content,
            m.CreatedAt,
            m.ParentMessageId
        });
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateConversation([FromBody] CreateConversationRequest request)
    {
        var userId = GetUserId();
        var conversation = await _conversationService.CreateConversationAsync(userId, request.Title);
        return Ok(conversation);
    }

    [HttpPost("sync")]
    public async Task<IActionResult> SyncConversations([FromBody] List<SyncConversationRequest> requests)
    {
        var userId = GetUserId();
        await _conversationService.SyncConversationsAsync(userId, requests);
        return Ok();
    }

    private Guid GetUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(userIdString!);
    }
}

public class CreateConversationRequest
{
    public string Title { get; set; } = "New Conversation";
}
