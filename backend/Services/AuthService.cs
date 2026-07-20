using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using PcInventory.DTOs;
using PcInventory.Models;
using PcInventory.Repositories;

namespace PcInventory.Services;

/// <summary>
/// Serviço de autenticação com JWT
/// </summary>
public class AuthService
{
    private readonly string _jwtSecretKey;
    private readonly string _jwtIssuer;
    private readonly string _jwtAudience;
    private readonly UserRepository _userRepository;
    private const int AccessTokenExpirationMinutes = 15;
    private const int RefreshTokenExpirationDays = 7;

    public AuthService(IConfiguration configuration, UserRepository userRepository)
    {
        _jwtSecretKey = configuration["Jwt:SecretKey"]
            ?? throw new ArgumentNullException(nameof(configuration), "Jwt:SecretKey not configured");
        _jwtIssuer = configuration["Jwt:Issuer"] ?? "PcInventory";
        _jwtAudience = configuration["Jwt:Audience"] ?? "PcInventoryClient";
        _userRepository = userRepository;
    }

    /// <summary>
    /// Autentica usuário e retorna tokens JWT
    /// </summary>
    public async Task<AuthResponse?> AuthenticateAsync(string usuario, string password)
    {
        var user = await _userRepository.GetByUsuarioAsync(usuario);

        if (user == null)
            return null;

        if (!VerifyPassword(password, user.PasswordHash))
            return null;

        var accessToken = GenerateAccessToken(user);
        var refreshToken = GenerateRefreshToken();

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn = AccessTokenExpirationMinutes * 60,
            TokenType = "Bearer"
        };
    }

    /// <summary>
    /// Gera novo access token a partir de refresh token
    /// </summary>
    public async Task<string?> RefreshAccessTokenAsync(string usuario)
    {
        var user = await _userRepository.GetByUsuarioAsync(usuario);
        return user != null ? GenerateAccessToken(user) : null;
    }

    /// <summary>
    /// Valida e extrai claims do JWT
    /// </summary>
    public ClaimsPrincipal? ValidateToken(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSecretKey);

            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _jwtIssuer,
                ValidateAudience = true,
                ValidAudience = _jwtAudience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            return principal;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Gera access token JWT com expiração curta
    /// </summary>
    private string GenerateAccessToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSecretKey);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Usuario),
                new Claim(ClaimTypes.Name, user.Name)
            }),
            Expires = DateTime.UtcNow.AddMinutes(AccessTokenExpirationMinutes),
            Issuer = _jwtIssuer,
            Audience = _jwtAudience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    /// <summary>
    /// Gera refresh token aleatório
    /// </summary>
    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }

    /// <summary>
    /// Hash de senha com PBKDF2-SHA256
    /// </summary>
    private static string HashPassword(string password)
    {
        var salt = new byte[16];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(salt);
        }

        byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            10000,
            HashAlgorithmName.SHA256,
            20);

        byte[] hashWithSalt = new byte[36];
        Array.Copy(salt, 0, hashWithSalt, 0, 16);
        Array.Copy(hash, 0, hashWithSalt, 16, 20);

        return Convert.ToBase64String(hashWithSalt);
    }

    /// <summary>
    /// Verifica se senha corresponde ao hash
    /// </summary>
    private static bool VerifyPassword(string password, string hash)
    {
        byte[] hashWithSalt = Convert.FromBase64String(hash);
        byte[] salt = new byte[16];
        Array.Copy(hashWithSalt, 0, salt, 0, 16);

        byte[] computedHash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            10000,
            HashAlgorithmName.SHA256,
            20);

        for (int i = 0; i < 20; i++)
        {
            if (hashWithSalt[i + 16] != computedHash[i])
                return false;
        }

        return true;
    }
}
