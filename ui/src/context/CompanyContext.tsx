import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Company } from '@aidrivencompany/shared';
import { fetchCompanies } from '@/api/companies';

interface CompanyContextValue {
  company: Company | null;
  companies: Company[];
  loading: boolean;
  switchCompany: (id: string) => void;
}

const CompanyContext = createContext<CompanyContextValue>({
  company: null,
  companies: [],
  loading: true,
  switchCompany: () => {},
});

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies()
      .then((list) => {
        setCompanies(list);
        if (list.length > 0) {
          setCompany(list[0]!);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch companies:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  function switchCompany(id: string) {
    const found = companies.find((c) => c.id === id);
    if (found) setCompany(found);
  }

  return (
    <CompanyContext.Provider value={{ company, companies, loading, switchCompany }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  return useContext(CompanyContext);
}
