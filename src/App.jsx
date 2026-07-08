import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from './components/layout/BottomNav';

// Pages
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Journey from './pages/Journey';
import Agenda from './pages/Agenda';
import Ranking from './pages/Ranking';
import Profile from './pages/Profile';
import Assignments from './pages/Assignments';
import Financial from './pages/Financial';
import BookClub from './pages/BookClub';

import Opportunities from './pages/Opportunities';
import Documents from './pages/Documents';
import Admin from './pages/Admin';
import Points from './pages/Points';
import Attendance from './pages/Attendance';
import CycleInfo from './pages/CycleInfo';
import Demands from './pages/Demands';
import PointsCriteria from './pages/PointsCriteria';
import Collaboration from './pages/Collaboration';
import Library from './pages/Library';
import Directory from './pages/Directory';
import ExtraordinaryEvents from './pages/ExtraordinaryEvents';
import BoardArea from './pages/BoardArea';
import ReceptionSignup from './pages/ReceptionSignup';
import TerminationRequest from './pages/TerminationRequest';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/" element={<Home />} />
          <Route path="/jornada" element={<Journey />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/tarefas" element={<Assignments initialTab="tarefas" />} />
          <Route path="/financeiro" element={<Financial />} />
          <Route path="/clube-livro" element={<BookClub />} />
          <Route path="/rol" element={<Assignments initialTab="rol" />} />
          <Route path="/oportunidades" element={<Opportunities />} />
          <Route path="/documentos" element={<Documents />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/pontos" element={<Points />} />
          <Route path="/presenca" element={<Attendance />} />
          <Route path="/ciclo" element={<CycleInfo />} />
          <Route path="/demandas" element={<Demands />} />
          <Route path="/criterios-pontuacao" element={<PointsCriteria />} />
          <Route path="/colaboracoes" element={<Collaboration />} />
          <Route path="/biblioteca" element={<Library />} />
          <Route path="/diretorio" element={<Directory />} />
          <Route path="/eventos-extraordinarios" element={<ExtraordinaryEvents />} />
          <Route path="/diretoria" element={<BoardArea />} />
          <Route path="/recepcao-sombra" element={<ReceptionSignup />} />
          <Route path="/solicitar-desligamento" element={<TerminationRequest />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
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