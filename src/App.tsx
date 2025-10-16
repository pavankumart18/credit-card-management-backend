import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import Dashboard from "./pages/Dashboard";
import AddCard from "./pages/AddCard";
import CardDetails from "./pages/CardDetails";
import BillPayments from "./pages/BillPayments";
import CardBlock from "./pages/CardBlock";
import PinManagement from "./pages/PinManagement";
import CibilScore from "./pages/CibilScore";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import TransactionsPage from './pages/TransactionsPage'
import RedeemsPage from './pages/RedeemsPage'
import EmiManagerPage from './pages/EmiManagerPage'
import SpendingAnalyticsPage from './pages/SpendingAnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import OffersPage from './pages/OffersPage'
import NotificationsPage from './pages/NotificationsPage'
import StatementsPage from './pages/StatementsPage'
import ApplyEmiPage from './pages/ApplyEmi'
import MyCardsPage from './pages/MyCards'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-card" element={<AddCard />} />
        <Route path="/card/:id" element={<CardDetails />} />
        <Route path="/bill-payments" element={<BillPayments />} />
        <Route path="/card-block" element={<CardBlock />} />
        <Route path="/pin-management" element={<PinManagement />} />
        <Route path="/cibil-score" element={<CibilScore />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/support" element={<Support />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/redeems" element={<RedeemsPage />} />
        <Route path="/emi" element={<EmiManagerPage />} />
        <Route path="/analytics" element={<SpendingAnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/statements" element={<StatementsPage />} />
        <Route path="/apply-emi" element={<ApplyEmiPage />} />
        <Route path="/cards" element={<MyCardsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App