import { useState, useEffect } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '@/UI/Sidebar';
import { LuChartColumn, LuClipboardPlus   } from "react-icons/lu";
import Consultations from './Consultations';
import Home from './Home';

const Dashboard = () => {

  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');


  const navigationConfig = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LuChartColumn,
      component: Home
    },
    {
      id: 'consultations',
      label: 'New Consultation',
      icon: LuClipboardPlus,
      component: Consultations
    },
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
    <div className="max-h-screen max-w-[1920px] mx-auto flex">
      <div>
        <Sidebar
          user={user}
          navigation={navigationConfig}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  
  );
};

export default Dashboard; 