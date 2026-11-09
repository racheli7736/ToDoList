
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TodoApi;
using Microsoft.OpenApi.Models;
var builder = WebApplication.CreateBuilder(args);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

// Swagger
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});


// Database
var connectionString =
    builder.Configuration.GetConnectionString("ToDoDB")
    ?? throw new InvalidOperationException("Missing connection string");

builder.Services.AddDbContext<ToDoDbContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString)
    ));

// Password hashing
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

// JWT service
builder.Services.AddScoped<TokenService>();

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Missing JWT key");

if (Encoding.UTF8.GetByteCount(jwtKey) < 32)
    throw new InvalidOperationException("JWT key is too short");

// JWT authentication
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            ),

            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "Hello World!");

// Register
app.MapPost("/auth/register", async (
    RegisterRequest request,
    ToDoDbContext db,
    IPasswordHasher<User> passwordHasher) =>
{
    if (string.IsNullOrWhiteSpace(request.Username) ||
        string.IsNullOrWhiteSpace(request.Password))
        return Results.BadRequest("Username and password are required");

    if (request.Username.Length > 100 ||
        request.Password.Length < 8)
        return Results.BadRequest("Invalid username or password length");

    var username = request.Username.Trim();

    if (await db.Users.AnyAsync(u => u.Username == username))
        return Results.Conflict("Username already exists");

    var user = new User
    {
        Username = username
    };

    user.PasswordHash = passwordHasher.HashPassword(
        user, request.Password
    );

    db.Users.Add(user);

    try
    {
        await db.SaveChangesAsync();
    }
    catch (DbUpdateException)
    {
        return Results.Conflict("Could not create user");
    }

    return Results.Created(
        $"/users/{user.Id}",
        new { user.Id, user.Username }
    );
});

// Login
app.MapPost("/auth/login", async (
    LoginRequest request,
    ToDoDbContext db,
    IPasswordHasher<User> passwordHasher,
    TokenService tokenService) =>
{
    var user = await db.Users.FirstOrDefaultAsync(
        u => u.Username == request.Username
    );

    if (user == null)
        return Results.Unauthorized();

    var result = passwordHasher.VerifyHashedPassword(
        user,
        user.PasswordHash,
        request.Password
    );

    if (result == PasswordVerificationResult.Failed)
        return Results.Unauthorized();

    var token = tokenService.CreateToken(user);

    return Results.Ok(new { token });
});

// GET - all tasks
app.MapGet("/items", async (ToDoDbContext db) =>
{
    return await db.Items.ToListAsync();
}).RequireAuthorization();

// POST - create task
app.MapPost("/items", async (Item item, ToDoDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(item.Name))
        return Results.BadRequest("Task name is required");

    db.Items.Add(item);
    await db.SaveChangesAsync();

    return Results.Created($"/items/{item.Id}", item);
}).RequireAuthorization();

// PUT - update completion
app.MapPut("/items/{id:int}", async (
    int id,
    Item updatedItem,
    ToDoDbContext db) =>
{
    var item = await db.Items.FindAsync(id);

    if (item == null)
        return Results.NotFound();

    item.IsComplete = updatedItem.IsComplete;

    await db.SaveChangesAsync();

    return Results.NoContent();
}).RequireAuthorization();

// DELETE - remove task
app.MapDelete("/items/{id:int}", async (
    int id,
    ToDoDbContext db) =>
{
    var item = await db.Items.FindAsync(id);

    if (item == null)
        return Results.NotFound();

    db.Items.Remove(item);
    await db.SaveChangesAsync();

    return Results.NoContent();
}).RequireAuthorization();

app.Run();
