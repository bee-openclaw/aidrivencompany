import { Routes, Route } from 'react-router-dom';
import { CompanyProvider } from '@/context/CompanyContext';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { CompanyGraph } from '@/pages/CompanyGraph';
import { Simulations } from '@/pages/Simulations';
import { Campaigns } from '@/pages/Campaigns';
import { Proof } from '@/pages/Proof';
import { Decisions } from '@/pages/Decisions';
import { Genesis } from '@/pages/Genesis';
import { Settings } from '@/pages/Settings';

export function App() {
  return (
    <CompanyProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/graph" element={<CompanyGraph />} />
          <Route path="/simulations" element={<Simulations />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/proof" element={<Proof />} />
          <Route path="/decisions" element={<Decisions />} />
          <Route path="/genesis" element={<Genesis />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </CompanyProvider>
  );
}
