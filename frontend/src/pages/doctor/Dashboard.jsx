import { useState } from 'react';
import Sidebar from '../../UI/Sidebar';
import Home from './Home';
import { useAuth } from '@/contexts/AuthContext';
import { LuVideo } from "react-icons/lu";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('live');

  const { user } = useAuth(); 

  const navigationConfig = [
    { id: 'live', label: 'Live Calls', icon: LuVideo, component: Home }
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
};

export default Dashboard; 