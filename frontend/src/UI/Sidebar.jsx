import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ navigation, activeTab, onTabChange }) => {
    const { logout } = useAuth();

    const userName = localStorage.getItem('userName')
    const userRole = localStorage.getItem('userRole')

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="w-64 bg-gray-800 text-white h-screen flex flex-col">
            {/* User info header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        {userName.charAt(0)}
                    </div>
                    <div>
                        <p className="font-semibold">{userName}</p>
                        <p className="text-sm text-gray-400 capitalize">{userRole}</p>
                    </div>
                </div>
            </div>

            {/* Navigation items */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => onTabChange(item.id)}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${activeTab === item.id
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Logout button */}
            <div className="p-4 border-t border-gray-700">
                <button onClick={handleLogout} className="w-full px-3 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors">
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Sidebar
