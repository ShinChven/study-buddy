using System.Text;
using System.Linq;
using EduBuddy.Application.Interfaces;
using EduBuddy.Domain.Entities;
using EduBuddy.Infrastructure.Persistence;
using EduBuddy.Infrastructure.Services;
using EduBuddy.WebApi.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.AI;
using Mscc.GenerativeAI.Microsoft;
using AspNetCoreRateLimit;

var builder = WebApplication.CreateBuilder(args);

// Rate Limiting
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Info.Title = "EduBuddy API";
        document.Info.Version = "v1";
        document.Info.Description = "API for EduBuddy AI Study Assistant";
        return Task.CompletedTask;
    });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000") // Actual frontend port
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Database
builder.Services.AddDbContext<EduBuddyDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// AI Client
var geminiApiKey = builder.Configuration["GeminiApiKey"];
builder.Services.AddSingleton<IChatClient>(sp => new DynamicChatClient(sp, geminiApiKey ?? ""));

// Identity
builder.Services.AddIdentity<User, IdentityRole<Guid>>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 8;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<EduBuddyDbContext>()
.AddDefaultTokenProviders();

// Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var keyString = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key not found");
var key = Encoding.ASCII.GetBytes(keyString);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

builder.Services.AddAuthorization();

// Application Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISystemSettingsService, SystemSettingsService>();
builder.Services.AddScoped<IConversationService, ConversationService>();
builder.Services.AddScoped<IFollowUpService, FollowUpService>();

var app = builder.Build();

app.UseCors(); // Move to top
app.UseIpRateLimiting();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else 
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/hubs/chat");

// Seed Admin User
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

    if (!await roleManager.RoleExistsAsync("Admin"))
    {
        await roleManager.CreateAsync(new IdentityRole<Guid>("Admin"));
    }

    var adminEmail = "admin@edubuddy.com";
    var adminUser = await userManager.FindByEmailAsync(adminEmail);
    if (adminUser == null)
    {
        adminUser = new User
        {
            UserName = adminEmail,
            Email = adminEmail,
            DisplayName = "System Admin",
            EmailConfirmed = true
        };
        await userManager.CreateAsync(adminUser, "AdminPassword123!");
        await userManager.AddToRoleAsync(adminUser, "Admin");
    }

    // Seed System Prompt
    var dbContext = scope.ServiceProvider.GetRequiredService<EduBuddyDbContext>();
    var systemPrompt = await dbContext.SystemSettings.FindAsync("SystemPrompt");
    if (systemPrompt == null)
    {
        dbContext.SystemSettings.Add(new SystemSetting
        {
            Key = "SystemPrompt",
            Value = @"You are a professional and reliable middle/high school teacher. Your goal is to provide students with clear, accurate, and knowledge-rich explanations.

  Guidelines:
  1. KNOWLEDGE-FOCUSED: Focus on accurate scientific, historical, and technical facts. Avoid overly simplistic language or awkward metaphors.
  2. DATA-DRIVEN: When answering questions involving quantities, sizes, distances, or statistics, you MUST provide specific numbers and units.
  3. TEACHER TONE: Maintain a professional, rigorous, and inspiring tone. Explain concepts using clear and accurate terminology, as an excellent teacher would.
  4. STRUCTURED EXPRESSION: Use Markdown (tables, bullet points, headers) to organize complex information for better readability.
  5. DEPTH & CLARITY: Maintain depth in knowledge while ensuring it is easy to understand. If multiple data points are involved, prioritize using tables for presentation.",
            LastUpdated = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync();
    }
}

app.Run();
