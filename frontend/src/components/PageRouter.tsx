'use client';

import { useAppState } from '@/lib/store';
import dynamic from 'next/dynamic';

// Dynamic imports for code splitting
const DashboardPage = dynamic(() => import('@/components/pages/DashboardPage'), { ssr: false });
const DataInputPage = dynamic(() => import('@/components/pages/DataInputPage'), { ssr: false });
const ScenarioSetupPage = dynamic(() => import('@/components/pages/ScenarioSetupPage'), { ssr: false });
const RunSimulationPage = dynamic(() => import('@/components/pages/RunSimulationPage'), { ssr: false });
const ResultsPage = dynamic(() => import('@/components/pages/ResultsPage'), { ssr: false });
const ImpactAnalysisPage = dynamic(() => import('@/components/pages/ImpactAnalysisPage'), { ssr: false });
const ComparisonPage = dynamic(() => import('@/components/pages/ComparisonPage'), { ssr: false });
const ValidationPage = dynamic(() => import('@/components/pages/ValidationPage'), { ssr: false });
const ReportsPage = dynamic(() => import('@/components/pages/ReportsPage'), { ssr: false });
const AboutPage = dynamic(() => import('@/components/pages/AboutPage'), { ssr: false });

export function PageRouter() {
  const { currentPage } = useAppState();

  switch (currentPage) {
    case 'dashboard':
      return <DashboardPage />;
    case 'data-input':
      return <DataInputPage />;
    case 'scenario-setup':
      return <ScenarioSetupPage />;
    case 'run-simulation':
      return <RunSimulationPage />;
    case 'results':
      return <ResultsPage />;
    case 'impact':
      return <ImpactAnalysisPage />;
    case 'comparison':
      return <ComparisonPage />;
    case 'validation':
      return <ValidationPage />;
    case 'reports':
      return <ReportsPage />;
    case 'about':
      return <AboutPage />;
    default:
      return <DashboardPage />;
  }
}
