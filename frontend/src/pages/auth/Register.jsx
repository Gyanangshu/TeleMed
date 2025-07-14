import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../utils/axios';
import Logo from '@/UI/Logo';
import { LuCircleCheckBig } from "react-icons/lu";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'operator', // Default role
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/auth/register', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect based on role
      switch (response.data.user.role) {
        case 'operator':
          navigate('/operator');
          break;
        case 'doctor':
          navigate('/doctor');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full px-mobile xl:px-xlarge lg:px-large 2xl:max-w-[1440px] 2xl:mx-auto">
      {/* <div>
        <h2 className="mt-6 text-center text-4xl font-semibold text-gray-900">
          Create your account
        </h2>
      </div> */}

      <div className="flex w-full items-center justify-evenly gap-8">
        <div className='w-1/2 flex flex-col items-center'>
          <div className='flex flex-col gap-8'>
            <Link to={"/"}>
              <Logo bgheight={"h-12"} bgwidth={"w-12"} logoheight={"h-7"} logowidth={"w-7"} text={"text-3xl font-bold text-medical-800"} />
            </Link>

            <div className="flex flex-col gap-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-medical-900 ">
                Join the Future of
                <span className="block bg-gradient-to-r from-medical-600 to-emerald-600 bg-clip-text text-transparent pt-2">
                  Rural Healthcare
                </span>
              </h1>
              <p className="text-lg text-medical-700 max-w-lg mx-auto lg:mx-0">
                Connect with our growing network of healthcare professionals serving rural communities across India.
              </p>
            </div>

            <div className='flex flex-col gap-4'>
              <h3 className="font-semibold text-medical-900">
                Why join TeleMed?
              </h3>

              <div className='flex flex-col gap-3'>
                {[
                  "Reach underserved communities",
                  "Flexible consultation hours",
                  "Secure platform with digital records",
                  "Make real impact in rural health",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <LuCircleCheckBig className="w-5 h-5 text-emerald-600" />
                    <span className="text-medical-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>



        <form className="w-1/2 max-w-lg border border-medical-200 shadow-xl shadow-medical-100 bg-white/95 backdrop-blur-sm rounded-xl py-6 px-9 flex flex-col gap-8" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="flex flex-col gap-3 ">
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="border border-gray-300 outline-blue-500 rounded-md p-2"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="border border-gray-300 outline-blue-500 rounded-md p-2"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="border border-gray-300 outline-blue-500 rounded-md p-2"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="role" className="text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                required
                className="border border-gray-300 outline-blue-500 rounded-md p-2"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="operator">Operator</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Register
            </button>

            <div className="text-sm text-center mt-2">
              <a
                href="/login"
                className="font-medium"
              >
                Already have an account? <span className='text-red-500'>Login</span>
              </a>
            </div>
          </div>
        </form>


      </div>
    </div>
  );
} 