import { useEffect, useState } from 'react';
import { Shield, Star, BookOpen, MessageSquare, Quote } from 'lucide-react';
import type { ProofItem, ProofType } from '@aidrivencompany/shared';
import { useCompany } from '@/context/CompanyContext';
import { fetchProof } from '@/api/proof';
import { cn } from '@/lib/utils';

const TYPE_CONFIG: Record<ProofType, { icon: typeof Star; borderColor: string; label: string }> = {
  testimonial: { icon: MessageSquare, borderColor: 'border-l-cyan-400', label: 'Testimonial' },
  case_study: { icon: BookOpen, borderColor: 'border-l-emerald-400', label: 'Case Study' },
  review: { icon: Star, borderColor: 'border-l-amber-400', label: 'Review' },
};

const FILTERS: { label: string; value: 'all' | ProofType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Testimonials', value: 'testimonial' },
  { label: 'Case Studies', value: 'case_study' },
  { label: 'Reviews', value: 'review' },
];

const AVATAR_COLORS = [
  'bg-purple-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-indigo-500',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!;
}

function getInitials(name: string): string {
  return name
    .split(/[\s,]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function SkeletonPulse({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-600/40', className)} />;
}

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
      <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500 animate-fade-in">
        <Shield className="h-10 w-10" />
        <p className="text-lg font-medium">No company selected</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 animate-fade-in">
        <SkeletonPulse className="mb-2 h-8 w-48" />
        <SkeletonPulse className="mb-8 h-5 w-64" />
        <div className="mb-6 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonPulse key={i} className="h-9 w-28" />
          ))}
        </div>
        <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonPulse key={i} className="mb-4 h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <Shield className="h-7 w-7 text-amber-400" />
        <h1 className="text-2xl font-bold text-slate-100">Social Proof</h1>
      </div>

      {/* Filter pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-medium transition-all',
              filter === f.value
                ? 'bg-slate-800 text-slate-100 border-b-2 border-amber-500'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Proof cards */}
      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <Shield className="mb-4 h-12 w-12 text-slate-600" />
          <p className="text-lg font-medium text-slate-400">No proof items yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Testimonials, case studies, and reviews will appear here as they are collected.
          </p>
        </div>
      ) : (
        <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
          {filtered.map((item) => {
            const config = TYPE_CONFIG[item.type];
            const isTestimonial = item.type === 'testimonial';
            const isCaseStudy = item.type === 'case_study';

            return (
              <div
                key={item.id}
                className={cn(
                  'card mb-4 break-inside-avoid border-l-4 p-5',
                  config.borderColor,
                )}
              >
                {isTestimonial ? (
                  <>
                    {/* Quote marks */}
                    <Quote className="mb-2 h-8 w-8 text-slate-700" />

                    {/* Content */}
                    <p className="mb-4 text-sm italic leading-relaxed text-slate-200">
                      {item.content}
                    </p>

                    {/* Source */}
                    <div className="flex items-center gap-3 border-t border-slate-700/40 pt-4">
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white',
                          getAvatarColor(item.source),
                        )}
                      >
                        {getInitials(item.source)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-200">{item.source}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-sm font-semibold text-slate-200">
                          {item.impactScore}
                        </span>
                      </div>
                    </div>
                  </>
                ) : isCaseStudy ? (
                  <>
                    {/* Case study */}
                    <div className="mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                        Case Study
                      </span>
                    </div>

                    <h3 className="mb-2 text-sm font-semibold text-slate-100">{item.source}</h3>
                    <p className="mb-4 text-sm leading-relaxed text-slate-400">{item.content}</p>

                    <div className="flex items-center justify-between border-t border-slate-700/40 pt-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-sm font-semibold text-slate-200">
                          Impact: {item.impactScore}/10
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Review */}
                    <div className="mb-3 flex items-center justify-between">
                      <span className="badge bg-amber-500/20 text-amber-400">
                        <Star className="h-3 w-3" />
                        Review
                      </span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'h-3.5 w-3.5',
                              i < Math.round(item.impactScore / 2)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-700',
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="mb-4 text-sm leading-relaxed text-slate-300">{item.content}</p>

                    <div className="flex items-center justify-between border-t border-slate-700/40 pt-3">
                      <span className="text-xs text-slate-500">by {item.source}</span>
                      <span className="text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
