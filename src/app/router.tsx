import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/shared/components/AppLayout'
import { HomePage } from '@/features/home/pages/HomePage'
import { SinglePalacePage } from '@/features/single-palace/pages/SinglePalacePage'
import { TimeChartPage } from '@/features/time-chart/pages/TimeChartPage'
import { HarmQuickPage } from '@/features/palace-analysis/pages/HarmQuickPage'
import { CloudChartsPage } from '@/features/chart-history/pages/CloudChartsPage'
import { ChartDetailPage } from '@/features/chart-history/pages/ChartDetailPage'
import { AuthPanel } from '@/features/auth/components/AuthPanel'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'single-palace', element: <SinglePalacePage /> },
      { path: 'time-chart', element: <TimeChartPage /> },
      { path: 'harms', element: <HarmQuickPage /> },
      { path: 'charts', element: <CloudChartsPage /> },
      { path: 'charts/:id', element: <ChartDetailPage /> },
      { path: 'account', element: <AuthPanel /> },
    ],
  },
])
