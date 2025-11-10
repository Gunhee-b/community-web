import { useState } from 'react';
import BottomNav from './components/BottomNav';
import DemoControls from './components/DemoControls';
import LoginScreen from './components/screens/LoginScreen';
import SignupScreen from './components/screens/SignupScreen';
import ResetPasswordScreen from './components/screens/ResetPasswordScreen';
import HomeScreen from './components/screens/HomeScreen';
import MeetingsScreen from './components/screens/MeetingsScreen';
import QuestionsScreen from './components/screens/QuestionsScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import MeetingDetailScreen from './components/screens/MeetingDetailScreen';
import QuestionDetailScreen from './components/screens/QuestionDetailScreen';
import NotificationsScreen from './components/screens/NotificationsScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import AdminDashboardScreen from './components/screens/AdminDashboardScreen';
import VotingScreen from './components/screens/VotingScreen';

type Screen = 
  | 'login'
  | 'signup'
  | 'resetPassword'
  | 'home'
  | 'meetings'
  | 'questions'
  | 'profile'
  | 'meetingDetail'
  | 'questionDetail'
  | 'notifications'
  | 'settings'
  | 'adminDashboard'
  | 'voting'
  | 'createMeeting';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [currentTab, setCurrentTab] = useState('home');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true); // Set to true to show admin features
  const [notificationCount, setNotificationCount] = useState(3);
  const [selectedMeetingId, setSelectedMeetingId] = useState<number>(1);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number>(1);
  const [screenHistory, setScreenHistory] = useState<Screen[]>([]);

  const navigateTo = (screen: Screen) => {
    setScreenHistory([...screenHistory, currentScreen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (screenHistory.length > 0) {
      const previousScreen = screenHistory[screenHistory.length - 1];
      setScreenHistory(screenHistory.slice(0, -1));
      setCurrentScreen(previousScreen);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentScreen('home');
    setCurrentTab('home');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('login');
    setScreenHistory([]);
  };

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    setCurrentScreen(tab as Screen);
    setScreenHistory([]);
  };

  const handleMeetingDetail = (id: number) => {
    setSelectedMeetingId(id);
    navigateTo('meetingDetail');
  };

  const handleQuestionDetail = (id: number) => {
    setSelectedQuestionId(id);
    navigateTo('questionDetail');
  };

  const handleNotifications = () => {
    navigateTo('notifications');
  };

  const handleSettings = () => {
    navigateTo('settings');
  };

  const handleAdminDashboard = () => {
    navigateTo('adminDashboard');
  };

  const handleClearNotifications = () => {
    setNotificationCount(0);
  };

  const handleCreateMeeting = () => {
    // This would navigate to a create meeting form
    alert('Create Meeting feature - Navigate to meeting creation form');
  };

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleAdminToggle = () => {
    setIsAdmin(!isAdmin);
  };

  const renderScreen = () => {
    // Authentication screens
    if (!isAuthenticated) {
      switch (currentScreen) {
        case 'login':
          return (
            <LoginScreen
              onLogin={handleLogin}
              onSignup={() => navigateTo('signup')}
              onResetPassword={() => navigateTo('resetPassword')}
              theme={theme}
            />
          );
        case 'signup':
          return (
            <SignupScreen
              onBack={goBack}
              onSignup={handleLogin}
              theme={theme}
            />
          );
        case 'resetPassword':
          return (
            <ResetPasswordScreen
              onBack={goBack}
              theme={theme}
            />
          );
        default:
          return null;
      }
    }

    // Main app screens
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            onNotifications={handleNotifications}
            onQuestionDetail={handleQuestionDetail}
            onMeetingDetail={handleMeetingDetail}
            onVoting={() => navigateTo('voting')}
            theme={theme}
            notificationCount={notificationCount}
          />
        );
      case 'meetings':
        return (
          <MeetingsScreen
            onMeetingDetail={handleMeetingDetail}
            onCreateMeeting={handleCreateMeeting}
            theme={theme}
          />
        );
      case 'questions':
        return (
          <QuestionsScreen
            onQuestionDetail={handleQuestionDetail}
            theme={theme}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            onSettings={handleSettings}
            onLogout={handleLogout}
            theme={theme}
            isAdmin={isAdmin}
            onAdminDashboard={handleAdminDashboard}
          />
        );
      case 'meetingDetail':
        return (
          <MeetingDetailScreen
            onBack={goBack}
            meetingId={selectedMeetingId}
            theme={theme}
          />
        );
      case 'questionDetail':
        return (
          <QuestionDetailScreen
            onBack={goBack}
            questionId={selectedQuestionId}
            theme={theme}
          />
        );
      case 'notifications':
        return (
          <NotificationsScreen
            onBack={goBack}
            theme={theme}
            onClearNotifications={handleClearNotifications}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            onBack={goBack}
            theme={theme}
            onThemeChange={setTheme}
          />
        );
      case 'adminDashboard':
        return (
          <AdminDashboardScreen
            onBack={goBack}
            theme={theme}
          />
        );
      case 'voting':
        return (
          <VotingScreen
            onBack={goBack}
            theme={theme}
          />
        );
      default:
        return null;
    }
  };

  const showBottomNav = isAuthenticated && !['meetingDetail', 'questionDetail', 'notifications', 'settings', 'adminDashboard', 'voting'].includes(currentScreen);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {renderScreen()}
      {showBottomNav && (
        <BottomNav
          currentTab={currentTab}
          onTabChange={handleTabChange}
          theme={theme}
        />
      )}
      <DemoControls
        theme={theme}
        onThemeToggle={handleThemeToggle}
        isAdmin={isAdmin}
        onAdminToggle={handleAdminToggle}
        showAdminToggle={isAuthenticated}
      />
    </div>
  );
}
