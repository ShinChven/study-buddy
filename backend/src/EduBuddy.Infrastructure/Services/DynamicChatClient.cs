using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using EduBuddy.Application.Interfaces;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.DependencyInjection;
using Mscc.GenerativeAI.Microsoft;

namespace EduBuddy.Infrastructure.Services;

public class DynamicChatClient : IChatClient
{
    private readonly IServiceProvider _serviceProvider;
    private readonly string _defaultKey;

    public DynamicChatClient(IServiceProvider serviceProvider, string defaultKey)
    {
        _serviceProvider = serviceProvider;
        _defaultKey = defaultKey;
    }

    private async Task<IChatClient> GetClientAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var settingsService = scope.ServiceProvider.GetRequiredService<ISystemSettingsService>();
        var key = await settingsService.GetSettingAsync("GeminiApiKey");
        
        if (string.IsNullOrEmpty(key))
        {
            key = _defaultKey;
        }

        if (!string.IsNullOrEmpty(key) && key != "YOUR_GEMINI_API_KEY" && key != "your_gemini_api_key_here")
        {
            return new GeminiChatClient(apiKey: key, model: "gemini-3-flash-preview");
        }
        
        return new NullChatClient();
    }

    public void Dispose()
    {
    }

    public async Task<ChatResponse> GetResponseAsync(IEnumerable<ChatMessage> messages, ChatOptions? options = null, CancellationToken cancellationToken = default)
    {
        var client = await GetClientAsync();
        return await client.GetResponseAsync(messages, options, cancellationToken);
    }

    public async IAsyncEnumerable<ChatResponseUpdate> GetStreamingResponseAsync(IEnumerable<ChatMessage> messages, ChatOptions? options = null, [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var client = await GetClientAsync();
        await foreach (var update in client.GetStreamingResponseAsync(messages, options, cancellationToken))
        {
            yield return update;
        }
    }

    public object? GetService(Type serviceType, object? serviceKey = null)
    {
        return serviceType == typeof(IChatClient) ? this : null;
    }
}

public class NullChatClient : IChatClient
{
    public void Dispose() { }
    
    public Task<ChatResponse> GetResponseAsync(IEnumerable<ChatMessage> messages, ChatOptions? options = null, CancellationToken cancellationToken = default) 
        => Task.FromResult(new ChatResponse(new ChatMessage(ChatRole.Assistant, "AI provider is not configured. Please set an API key in the Admin settings.")));
        
    public IAsyncEnumerable<ChatResponseUpdate> GetStreamingResponseAsync(IEnumerable<ChatMessage> messages, ChatOptions? options = null, [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        return GetEmptyAsyncEnumerable();
    }

    private async IAsyncEnumerable<ChatResponseUpdate> GetEmptyAsyncEnumerable()
    {
        yield break;
    }

    public object? GetService(Type serviceType, object? serviceKey = null) => null;
}
