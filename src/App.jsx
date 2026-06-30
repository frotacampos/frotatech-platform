import { Toaster } from "@/components/ui/toaster"
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
// Add page imports here
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import RegistrarProblema from './pages/RegistrarProblema';
import Chamados from './pages/Chamados';
import AdminDashboard from './pages/AdminDashboard';
import Mapa from './pages/Mapa.jsx';
import Perfil from './pages/Perfil';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import RoleRedirect from './pages/RoleRedirect';
import CadastrarEmpresa from './pages/CadastrarEmpresa';
import CidadaoLogin from './pages/CidadaoLogin';
import CidadaoCadastro from './pages/CidadaoCadastro';
import Almoxarifado from './pages/Almoxarifado';
import Relatorios from './pages/Relatorios';
import ConfiguracaoEmpresa from './pages/ConfiguracaoEmpresa';
import AcessoOperador from './pages/AcessoOperador';
import MeusChamados from './pages/MeusChamados';
import Documentacao from './pages/Documentacao';
import PlatformLogin from './pages/PlatformLogin';

const apiMode = import.meta.env.VITE_API_MODE || 'base44';

const HomeRedirectToLogin = () => {
  const { navigateToLogin } = useAuth();
  React.useEffect(() => { navigateToLogin(); }, []);
  return null;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-lumicity-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl gradient-lumicity flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else {
      // For auth_required or any other error, still allow public pages
      return (
        <Routes>
          {apiMode === 'http' && <Route path="/login" element={<PlatformLogin />} />}
          <Route path="/" element={<Home />} />
          <Route path="/registrar-problema" element={<RegistrarProblema />} />
          <Route path="/cadastrar-empresa" element={<CadastrarEmpresa />} />
          <Route path="/cidadao-login" element={apiMode === 'http' ? <PlatformLogin /> : <CidadaoLogin />} />
          <Route path="/cidadao-cadastro" element={<CidadaoCadastro />} />
          <Route path="/almoxarifado" element={<Almoxarifado />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/configuracao-empresa" element={<ConfiguracaoEmpresa />} />
          <Route path="/acesso-operador" element={apiMode === 'http' ? <PlatformLogin /> : <AcessoOperador />} />
          <Route path="/meus-chamados" element={<MeusChamados />} />
          <Route path="/documentacao" element={<Documentacao />} />
          <Route path="*" element={apiMode === 'http' ? <PlatformLogin /> : <HomeRedirectToLogin />} />
        </Routes>
      );
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {apiMode === 'http' && <Route path="/login" element={<PlatformLogin />} />}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/registrar-problema" element={<RegistrarProblema />} />
      <Route path="/cadastrar-empresa" element={<CadastrarEmpresa />} />
      <Route path="/cidadao-login" element={apiMode === 'http' ? <PlatformLogin /> : <CidadaoLogin />} />
      <Route path="/cidadao-cadastro" element={<CidadaoCadastro />} />
      <Route path="/chamados" element={<Chamados />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/mapa" element={<Mapa />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/usuarios" element={<GerenciarUsuarios />} />
      <Route path="/redirect" element={<RoleRedirect />} />
      <Route path="/almoxarifado" element={<Almoxarifado />} />
      <Route path="/relatorios" element={<Relatorios />} />
      <Route path="/configuracao-empresa" element={<ConfiguracaoEmpresa />} />
      <Route path="/acesso-operador" element={apiMode === 'http' ? <PlatformLogin /> : <AcessoOperador />} />
      <Route path="/meus-chamados" element={<MeusChamados />} />
      <Route path="/documentacao" element={<Documentacao />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
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
