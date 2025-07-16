import { useState, useEffect } from 'react';
import Home from './Home';
import Sidebar from '@/UI/Sidebar';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboard() {

  const [activeTab, setActiveTab] = useState('dashboard');

  const { user } = useAuth();

  const navigationConfig = [
    { id: 'dashboard', label: 'Dashboard', icon: 'Home', component: Home },
    { id: 'Queue', label: 'Queue', icon: 'Home', component: 'Home' },
    { id: 'Reports', label: 'Reports', icon: 'Home', component: 'Home' }
  ]

  // Find the active navigation item
  const activeNavItem = navigationConfig.find(item => item.id === activeTab);

  const renderContent = () => {
    if (!activeNavItem) return <div>Page not found</div>;

    const ComponentName = activeNavItem.component;

    if (ComponentName) {
      return <ComponentName />;
    } else {
      // Fallback to generic page
      return <div>Not found</div>;
    }
  };

  return (
    <div className="min-h-screen max-w-[1920px] mx-auto flex">
      <Sidebar
        user={user}
        navigation={navigationConfig}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
} 