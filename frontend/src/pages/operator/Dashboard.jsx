import { useState, useEffect } from 'react';
import Sidebar from '@/UI/Sidebar';
import { LuChartColumn, LuClipboardPlus } from "react-icons/lu";
import Consultations from './Consultations';
import Home from './Home';
import axios from "@/utils/axios"

const Dashboard = () => {

  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState([]);
  const [allConsultations, setAllConsultations] = useState([]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/users/me');
      setUserData(response.data);
    } catch (error) {
      console.log("error fetching userData: ", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [])

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.post('/calls/created', {
          userId: userData._id
        })
        setAllConsultations(response.data.calls)
      } catch (error) {
        console.log("error fetching userData: ", error);
      }
    }

    fetchUserId()
  }, [userData])

  const navigationConfig = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LuChartColumn,
      component: (props) => <Home {...props} allConsultations={allConsultations} userData={userData}/>
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

  console.log("userData", userData._id)
  console.log("allConsultations", allConsultations)

  return (
    <div className="max-h-screen max-w-[1920px] mx-auto flex">
      <div className='z-30'>
        <Sidebar
          userData={userData}
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