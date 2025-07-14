import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../utils/axios';
import { connectSocket } from '../../utils/socket';
import Logo from '@/UI/Logo';
import { LuUser } from "react-icons/lu";
import { LuLock } from "react-icons/lu";
import { TbCircleArrowRightFilled } from "react-icons/tb";
import { LuEyeOff } from "react-icons/lu";
import { LuEye } from "react-icons/lu";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/auth/login', formData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userName', user.name);

      connectSocket(token);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full px-mobile xl:px-xlarge lg:px-large 2xl:max-w-[1440px] 2xl:mx-auto lg:py-0 py-12">
      <div className="flex flex-wrap w-full items-center justify-evenly lg:gap-8 gap-16">
        <div className='lg:w-1/2 w-full flex flex-col items-center'>
          <div>
            <Link to={"/"}>
              <Logo bgheight={"h-12"} bgwidth={"w-12"} logoheight={"h-7"} logowidth={"w-7"} text={"text-3xl font-bold text-medical-800"} />
            </Link>

            <div className="flex flex-col gap-4 mt-10">
              <h1 className="text-4xl lg:text-5xl font-bold text-medical-900 ">
                Welcome Back to
                <span className="block bg-gradient-to-r from-medical-600 to-emerald-600 bg-clip-text text-transparent pt-2">
                  Rural Healthcare
                </span>
              </h1>
              <p className="text-lg text-medical-700 max-w-lg mx-auto lg:mx-0">
                Sign in to continue connecting patients with specialists across
                India.
              </p>
            </div>
          </div>
        </div>

        <form className="lg:w-1/2 w-full max-w-lg border border-medical-200 shadow-xl shadow-medical-100 bg-white/95 backdrop-blur-sm rounded-xl py-6 px-9 flex flex-col gap-8"
          onSubmit={handleSubmit}>

          <div>
            <h3 className='text-center text-3xl font-semibold text-medical-800'>Sign In</h3>
            <p className='text-center pt-2 text-medical-700 text-md'>Please enter your credentials</p>
          </div>

          <div className="flex flex-col gap-6">
            <div className='flex flex-col gap-2 relative'>
              <LuUser className="absolute left-3 top-[58%] transform  text-medical-400 w-4 h-4" />
              <label htmlFor="email" className="text-sm font-medium text-medical-800">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="pl-10 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className='flex flex-col gap-2 relative'>
              <LuLock className="absolute left-3 top-[58%] transform text-medical-400 w-4 h-4" />
              <label htmlFor="password" className="text-sm font-medium text-medical-800">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="pl-10 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />

              {showPassword ?
                <LuEye onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[58%] transform text-medical-400 w-4 h-4 cursor-pointer" />
                :
                <LuEyeOff onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[58%] transform text-medical-400 w-4 h-4 cursor-pointer" />
              }
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
          </div>



          <button
            type="submit"
            className="group relative w-full flex items-center gap-1 justify-center py-2 px-4 border border-transparent font-medium rounded-md text-white bg-gradient-to-r from-medical-600 to-emerald-600 hover:from-medical-700 hover:to-emerald-700"
          >
            Sign in
            <TbCircleArrowRightFilled className='group-hover:translate-x-1 pt-[4px] text-xl transition-transform' />
          </button>


          <div className="text-center text-sm text-medical-600 pt-4 border-t-2 border-medical-100">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-medical-600 hover:text-medical-800 font-medium transition-colors"
            >
              Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 