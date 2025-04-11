import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';
import { generateConsultationReport } from '../../utils/reportGenerator';

export default function AdminDashboard() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, ongoing, completed
  const [selectedCall, setSelectedCall] = useState(null);
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  console.log("selectedCall: ", selectedCall)
  console.log("showReportPreview: ", showReportPreview)
  console.log("reportContent: ", reportContent)

  useEffect(() => {
    fetchCalls();
  }, [filter]);

  const fetchCalls = async () => {
    try {
      const response = await axios.get('/calls');
      let filteredCalls = response.data;

      if (filter === 'referred') {
        filteredCalls = response.data.filter(call => call.referred === true);
      } else if (filter === 'notreferred') {
        filteredCalls = response.data.filter(call => call.referred === false);
      } else if (filter !== 'all') {
        filteredCalls = response.data.filter(call => call.status === filter);
      }

      setCalls(filteredCalls);
    } catch (err) {
      setError('Failed to fetch calls');
    } finally {
      setLoading(false);
    }
  };

  console.log("calls data: ", calls);

  const handleLogout = () => {
    logout();
    navigate('/');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center gap-4">

              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Logout
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block pl-3 pr-10 py-2 text-base border-2 border-gray-300 focus:outline-none sm:text-sm rounded-md mt-12 cursor-pointer"
          >
            <option value="all">All Calls</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="referred">Referred: Yes</option>
            <option value="notreferred">Referred: No</option>
          </select>

          <div className="mt-6">
            {calls.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                No calls found
              </div>
            ) : (
              <>

                <div className="bg-white shadow border border-gray-400 rounded-lg mt-4 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className='w-full bg-gray-50' >
                      <tr>
                        <th className="py-2 px-4 border-b border-gray-300 text-left border-r">
                          Patient
                        </th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left border-r">
                          Age
                        </th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left border-r">
                          Sex
                        </th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left border-r">
                          Date & Time
                        </th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left border-r">
                          Referred
                        </th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left border-r">
                          Operator
                        </th>
                        <th className="py-2 px-4 border-b border-gray-300 text-left border-r">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className='w-full'>
                      {calls?.map((call) => (
                        <tr key={call._id}>
                          <td className="py-2 px-4 border-b border-gray-300">
                            {call?.patient?.name}
                          </td>
                          <td className="py-2 px-4 border-b border-gray-300">
                            {call?.patient?.age}
                          </td>
                          <td className="py-2 px-4 border-b border-gray-300">
                            {call?.patient?.sex}
                          </td>
                          <td className="py-2 px-4 border-b border-gray-300">
                            {new Date(call?.startTime).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: true,
                            })}
                          </td>
                          <td className="py-2 px-4 border-b border-gray-300">
                            {call?.referred ? 'Yes' : 'No'}
                          </td>
                          <td className="py-2 px-4 border-b border-gray-300">
                            {call?.operator?.name}
                          </td>
                          <td className="py-2 pl-4 border-b border-gray-300">
                            <button className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors' onClick={() => handleGenerateReport(call)}>
                              View Report
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                </div>
              </>
            )}

            {/* Report Preview Modal */}
            {showReportPreview && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[86vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">Consultation Report Preview</h3>
                      <button
                        onClick={() => setShowReportPreview(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div>
                      <iframe
                        src={reportContent.output('datauristring')}
                        className="w-full h-[60vh] border-0"
                        title="PDF Preview"
                      />
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                      <button
                        onClick={handlePrintReport}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Print Report
                      </button>
                      <button
                        onClick={handleDownloadReport}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 