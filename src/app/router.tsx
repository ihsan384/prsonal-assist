import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/contexts/AuthContext'

// Lazy-loaded Auth & Role pages
const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const UserManagementPage = lazy(() => import('@/features/admin/UserManagementPage'))

// Lazy-loaded top level pages
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const TasksPage = lazy(() => import('@/features/tasks/TasksPage'))
const HabitsPage = lazy(() => import('@/features/habits/HabitsPage'))
const FitnessPage = lazy(() => import('@/features/fitness/FitnessPage'))
const NutritionPage = lazy(() => import('@/features/nutrition/NutritionPage'))
const SleepPage = lazy(() => import('@/features/sleep/SleepPage'))
const GoalsPage = lazy(() => import('@/features/goals/GoalsPage'))
const KnowledgePage = lazy(() => import('@/features/knowledge/KnowledgePage'))
const FinancePage = lazy(() => import('@/features/finance/FinancePage'))
const AnalyticsPage = lazy(() => import('@/features/analytics/AnalyticsPage'))
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'))
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'))
const NotFoundPage = lazy(() => import('@/features/common/NotFoundPage'))
const ReflectionPage = lazy(() => import('@/features/reflection/ReflectionPage'))
const MotivationPage = lazy(() => import('@/features/motivation/MotivationPage'))
const MusicPage = lazy(() => import('@/features/music/MusicPage'))

// Settings sub-pages
const DatabaseHealthPage = lazy(() => import('@/features/settings/DatabaseHealthPage'))
const BackupCenterPage = lazy(() => import('@/features/settings/BackupCenterPage'))
const SyncLogPage = lazy(() => import('@/features/settings/SyncLogPage'))
const IntegrationsPage = lazy(() => import('@/features/settings/IntegrationsPage'))
const DiagnosticsPage = lazy(() => import('@/features/settings/DiagnosticsPage'))
const SyncQueuePage = lazy(() => import('@/features/settings/SyncQueuePage'))
const SpotifyCallbackPage = lazy(() => import('@/features/settings/SpotifyCallbackPage'))
const NotebookLMHubPage = lazy(() => import('@/features/knowledge/NotebookLMHubPage'))

// Study ERP sub-routes
const StudyLayout = lazy(() => import('@/features/study/layout/StudyLayout').then(m => ({ default: m.StudyLayout })))
const StudyOverview = lazy(() => import('@/features/study/overview/StudyOverview'))
const PomodoroPage = lazy(() => import('@/features/study/pomodoro/PomodoroPage'))
const SubjectsPage = lazy(() => import('@/features/study/subjects/SubjectsPage'))
const SubjectDetail = lazy(() => import('@/features/study/subjects/SubjectDetail'))
const ChapterDetail = lazy(() => import('@/features/study/chapters/ChapterDetail'))
const SessionsPage = lazy(() => import('@/features/study/sessions/SessionsPage'))
const NewSessionPage = lazy(() => import('@/features/study/sessions/NewSessionPage'))
const RevisionPage = lazy(() => import('@/features/study/revision/RevisionPage'))
const QuestionsPage = lazy(() => import('@/features/study/questions/QuestionsPage'))
const MockTestsPage = lazy(() => import('@/features/study/tests/MockTestsPage'))
const MistakeBookPage = lazy(() => import('@/features/study/mistakes/MistakeBookPage'))
const FormulaBookPage = lazy(() => import('@/features/study/formulas/FormulaBookPage'))
const NotesPage = lazy(() => import('@/features/study/notes/NotesPage'))
const StudyCalendar = lazy(() => import('@/features/study/calendar/StudyCalendar'))
const StatsPage = lazy(() => import('@/features/study/stats/StatsPage'))

function PageLoader() {
  return (
    <div className="px-4 py-4 flex flex-col gap-3">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  )
}

function withSuspense(Component: React.LazyExoticComponent<() => React.ReactElement>) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}

function PublicLoginRoute() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }
  return withSuspense(LoginPage)
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <PublicLoginRoute />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: withSuspense(DashboardPage) },

      // Admin Role Protected Route
      {
        path: 'admin/users',
        element: (
          <ProtectedRoute allowedRoles={['owner', 'admin']}>
            {withSuspense(UserManagementPage)}
          </ProtectedRoute>
        ),
      },

      // Study ERP Nested Sub-routes
      {
        path: 'study',
        element: withSuspense(StudyLayout as any),
        children: [
          { index: true, element: withSuspense(StudyOverview) },
          { path: 'pomodoro', element: withSuspense(PomodoroPage) },
          { path: 'subjects', element: withSuspense(SubjectsPage) },
          { path: 'subjects/:id', element: withSuspense(SubjectDetail) },
          { path: 'chapters/:id', element: withSuspense(ChapterDetail) },
          { path: 'sessions', element: withSuspense(SessionsPage) },
          { path: 'sessions/new', element: withSuspense(NewSessionPage) },
          { path: 'revision', element: withSuspense(RevisionPage) },
          { path: 'questions', element: withSuspense(QuestionsPage) },
          { path: 'tests', element: withSuspense(MockTestsPage) },
          { path: 'mistakes', element: withSuspense(MistakeBookPage) },
          { path: 'formulas', element: withSuspense(FormulaBookPage) },
          { path: 'notes', element: withSuspense(NotesPage) },
          { path: 'calendar', element: withSuspense(StudyCalendar) },
          { path: 'stats', element: withSuspense(StatsPage) },
        ],
      },

      { path: 'tasks', element: withSuspense(TasksPage) },
      { path: 'habits', element: withSuspense(HabitsPage) },
      { path: 'fitness', element: withSuspense(FitnessPage) },
      { path: 'nutrition', element: withSuspense(NutritionPage) },
      { path: 'sleep', element: withSuspense(SleepPage) },
      { path: 'goals', element: withSuspense(GoalsPage) },
      { path: 'knowledge', element: withSuspense(KnowledgePage) },
      { path: 'finance', element: withSuspense(FinancePage) },
      { path: 'analytics', element: withSuspense(AnalyticsPage) },
      { path: 'settings', element: withSuspense(SettingsPage) },
      { path: 'settings/db-health', element: withSuspense(DatabaseHealthPage) },
      { path: 'settings/backup', element: withSuspense(BackupCenterPage) },
      { path: 'settings/sync-log', element: withSuspense(SyncLogPage) },
      { path: 'settings/integrations', element: withSuspense(IntegrationsPage) },
      { path: 'settings/diagnostics', element: withSuspense(DiagnosticsPage) },
      { path: 'settings/sync-queue', element: withSuspense(SyncQueuePage) },
      { path: 'callback', element: withSuspense(SpotifyCallbackPage) },
      { path: 'knowledge/notebooklm', element: withSuspense(NotebookLMHubPage) },

      { path: 'profile', element: withSuspense(ProfilePage) },
      { path: 'reflection', element: withSuspense(ReflectionPage) },
      { path: 'motivation', element: withSuspense(MotivationPage) },
      { path: 'music', element: withSuspense(MusicPage) },
    ],
    errorElement: withSuspense(NotFoundPage),
  },
  {
    path: '*',
    element: withSuspense(NotFoundPage),
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

