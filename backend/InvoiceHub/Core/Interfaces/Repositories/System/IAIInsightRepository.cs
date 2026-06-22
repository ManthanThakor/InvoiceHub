using Core.Entities;

namespace Core.Interfaces.Repositories;

public interface IAIInsightRepository : IRepository<AIInsight>
{
    Task<IEnumerable<AIInsight>> GetUnreadAsync(Guid tenantId, CancellationToken ct = default);
}
