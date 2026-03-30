import { useEffect, useState } from 'react';
import { Award, Star, BookOpen, MessageSquare } from 'lucide-react';
import type { ProofItem, ProofType } from '@aidrivencompany/shared';
import { useCompany } from '@/context/CompanyContext';
import { fetchProof } from '@/api/proof';
import { cn } from '@/lib/utils';

const TYPE_STYLES: Record<ProofType, { bg: string; text: string; icon: typeof Star }> = {
  testimonial: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: MessageSquare },
  case_study: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: BookOpen },
  review: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: Star },
};

const FILTERS: { label: string; value: 'all' | ProofType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Testimonials', value: 'testimonial' },
  { label: 'Case Studies', value: 'case_study' },
  { label: 'Reviews', value: 'review' },
];

export function Proof() {
  const { company } = useCompany();
  const [items, setItems] = useState<ProofItem[]>([]);
  const [filter, setFilter] = useState<'all' | ProofType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company) return;
    setLoading(true);
    fetchProof(company.id)
      .then(setItems)
      .catch((err) => console.error('Proof fetch failed:', err))
      .finally(() => setLoading(false));
  }, [company?.id]);

  const filtered = filter === 'all' ? items : items.filter((p) => p.type === filter);

  if (!company) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        No company selected
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">Loading...</div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <Award className="h-6 w-6 text-cyan-400" />
        <h1 className="text-2xl font-bold text-gray-100">Proof Library</h1>
        <span className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-400">
          {items.length}
        </span>
      </div>

      <div className="mb-6 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              filter === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-12 text-center text-gray-500">
          No proof items found
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const style = TYPE_STYLES[item.type];
            const Icon = style.icon;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-gray-800 bg-gray-900 p-6"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium capitalize',
                      style.bg,
                      style.text,
                      'border-current/20',
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {item.type.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-sm font-medium text-gray-200">
                      {item.impactScore}
                    </span>
                  </div>
                </div>

                <p className="mb-3 line-clamp-4 text-sm text-gray-300">{item.content}</p>

                <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                  <span className="text-xs text-gray-500">Source: {item.source}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
