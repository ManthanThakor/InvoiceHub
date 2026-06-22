using Core.Entities;
using Core.Interfaces.Repositories;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class AIInsightRepository : Repository<AIInsight>, IAIInsightRepository
{
    public AIInsightRepository(AppDbContext db) : base(db) { }

    public async Task<IEnumerable<AIInsight>> GetUnreadAsync(Guid tenantId, CancellationToken ct = default)
    {
        return await _set
            .Where(a => a.TenantId == tenantId 
                     && !a.IsRead 
                     && (a.ExpiresAt == null || a.ExpiresAt > DateTime.UtcNow))
            .OrderByDescending(a => a.GeneratedAt)
            .ToListAsync(ct);
    }
}
