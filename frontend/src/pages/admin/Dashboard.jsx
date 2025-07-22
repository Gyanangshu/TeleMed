import { useState, useEffect } from 'react';
import Home from './Home';
import Reports from './Reports';
import Sidebar from '@/UI/Sidebar';
import { LuChartColumn, LuFileText, LuHospital  } from "react-icons/lu";
import { FaUserDoctor } from "react-icons/fa6";
import axios from "@/utils/axios"
import { generateConsultationReport } from '@/utils/reportGenerator';
import Doctors from './Doctors';
import Operators from './Operators';

export default function AdminDashboard() {

  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCall, setSelectedCall] = useState(null);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [filter, setFilter] = useState('all'); // all, ongoing, completed
  const [doctors, setDoctors] = useState([]);
  const [operators, setOperators] = useState([]);
  const [userData, setUserData] = useState([]);

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('/users/doctors');
        setDoctors(response.data)
      } catch (error) {
        console.log(error)
      }
    };

    const fetchOperators = async () => {
      try {
        const response = await axios.get('/users/operators');
        setOperators(response.data);
      } catch (error) {
        console.log(error)
      }
    }

    fetchDoctors();
    fetchOperators()
  }, [])

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/calls');
      let filteredCalls = response.data;

      if (filter === 'referred') {
        filteredCalls = response.data.filter(call => call.referred === true);
      } else if (filter === 'non-referred') {
        filteredCalls = response.data.filter(call => call.referred === false);
      } else if (filter !== 'all') {
        filteredCalls = response.data.filter(call => call.status === filter);
      }

      setCalls(filteredCalls);
    } catch (err) {
      setError('Failed to fetch calls. Please check you internet connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, [filter]);

  console.log("Doctors: ", doctors)
  console.log("operators: ", operators)

  const handleGenerateReport = (call) => {
    setSelectedCall(call);
    const doc = generateConsultationReport(call, call.patient);
    setReportContent(doc);
    setShowReportPreview(true);
  };

  const handleDownloadReport = () => {
    const doc = reportContent;
    doc.save(`consultation-report-${selectedCall.patient.name}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handlePrintReport = () => {
    console.log("reportContent: ", reportContent)
    const doc = reportContent;
    doc.autoPrint();

    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);

    const printWindow = window.open(blobUrl, '_blank');
    if (printWindow) {
      // Optional: clean up the object URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 10000);
    } else {
      alert('Please allow popups for this site to print the report.');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const navigationConfig = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LuChartColumn,
      component: (props) =>
        <Home {...props} calls={calls} loading={loading} error={error} showReportPreview={showReportPreview} setShowReportPreview={setShowReportPreview} reportContent={reportContent} handleGenerateReport={handleGenerateReport} handleDownloadReport={handleDownloadReport} handlePrintReport={handlePrintReport} selectedCall={selectedCall} />
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: LuFileText,
      component: (props) => <Reports {...props} calls={calls} loading={loading} error={error} showReportPreview={showReportPreview} setShowReportPreview={setShowReportPreview} reportContent={reportContent} handleGenerateReport={handleGenerateReport} handleDownloadReport={handleDownloadReport} handlePrintReport={handlePrintReport} selectedCall={selectedCall} filter={filter} setFilter={setFilter} />
    },
    {
      id: 'doctors',
      label: 'Doctors',
      icon: FaUserDoctor,
      component: (props) => <Doctors {...props} doctors={doctors} setDoctors={setDoctors} />
    },
    {
      id: 'operators',
      label: 'Operators',
      icon: LuHospital ,
      component: (props) => <Operators {...props} operators={operators} setOperators={setOperators} />
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
} 