import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigationType } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from './components/layout/BottomNav';

// Pages
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Journey from './pages/Journey';
import Agenda from './pages/Agenda';
import Ranking from './pages/Ranking';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Financial from './pages/Financial';
import BookClub from './pages/BookClub';
import ROL from './pages/ROL';
import Opportunities from './pages/Opportunities';
import Documents from './pages/Documents';
import Admin from './pages/Admin';
import Points from './pages/Points';
import Attendance from './pages/Attendance';
import CycleInfo from './pages/CycleInfo';
import Demands from './pages/Demands';
import PointsCriteria from './pages/PointsCriteria';
import Collaboration from './pages/Collaboration';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();
  const navType = useNavigationType(); // "POP" = back, "PUSH" = forward, "REPLACE"
  const isBack = navType === "POP";
  const xIn = isBack ? -18 : 18;
  const xOut = isBack ? 18 : -18;

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          style={{
            position: "absolute",
            inset: 0,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            zIndex: 0,
          }}
        >
          <Routes location={location}>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/" element={<Home />} />
            <Route path="/jornada" element={<Journey />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/tarefas" element={<Tasks />} />
            <Route path="/financeiro" element={<Financial />} />
            <Route path="/clube-livro" element={<BookClub />} />
            <Route path="/rol" element={<ROL />} />
            <Route path="/oportunidades" element={<Opportunities />} />
            <Route path="/documentos" element={<Documents />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/pontos" element={<Points />} />
            <Route path="/presenca" element={<Attendance />} />
            <Route path="/ciclo" element={<CycleInfo />} />
            <Route path="/demandas" element={<Demands />} />
            <Route path="/criterios-pontuacao" element={<PointsCriteria />} />
            <Route path="/colaboracoes" element={<Collaboration />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      <BottomNav />
    </>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App