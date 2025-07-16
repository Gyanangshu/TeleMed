import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../utils/axios';
import Logo from '@/UI/Logo';
import { LuCircleCheckBig, LuLock, LuUser, LuShield, LuHeart, LuPhone, LuMail, LuEye, LuEyeOff, LuLoader } from "react-icons/lu";
import { FiUsers } from "react-icons/fi";
import { TbCircleArrowRightFilled } from 'react-icons/tb';
import { Building, MapPin } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // step 1: role
    role: selectedRole,

    // step 2: basic info & credentials 
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',

    // step 3: role specific info 
    specialization: '',
    medicalLicense: '',
    experience: '',
    hospitalName: '',
    location: ''
  });
  const [error, setError] = useState('');

  const [formStep, setFormStep] = useState(1);

  const handleNext = (e) => {
    e.preventDefault();
    setFormStep((prev) => prev + 1);
  };

  const handlePrev = (e) => {
    e.preventDefault();
    setFormStep((prev) => prev - 1);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formStep < 3) return;
    setLoading(true);
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

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
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const roles = [
    {
      id: "doctor",
      title: "Doctor",
      desc: "Medical specialists providing consultations",
      icon: LuHeart,
      color: "emerald",
      bgGradient: "from-emerald-500 to-emerald-600",
      requirements: [
        "Medical License",
        "Specialization",
        "Hospital Affiliation",
      ],
    },
    {
      id: "operator",
      title: "Healthcare Operator",
      desc: "Village health workers facilitating consultations",
      icon: FiUsers,
      color: "medical",
      bgGradient: "from-medical-500 to-medical-600",
      requirements: ["Health Center Info", "Location", "Training Certificate"],
    },
    {
      id: "admin",
      title: "System Admin",
      desc: "Platform administrators managing the system",
      icon: LuShield,
      color: "medical",
      bgGradient: "from-medical-600 to-medical-700",
      requirements: ["Admin Code", "Organization", "Access Level"],
    },
  ];

  console.log(formData)

  return (
    <div className="min-h-screen flex items-center justify-center w-full px-mobile xl:px-xlarge lg:px-large 2xl:max-w-[1440px] 2xl:mx-auto">
      <div className="flex w-full items-center justify-evenly gap-8">

        {/* left side */}
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

        <form className="w-1/2 max-w-lg border border-medical-200 shadow-xl shadow-medical-100 bg-white/95 backdrop-blur-sm rounded-xl py-6 my-6 px-9 flex flex-col gap-8" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="text-center">
            <h1 className="text-2xl text-medical-900 font-semibold">
              Create Account
            </h1>
            <div className="flex items-center justify-center space-x-2 mt-4">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${step === formStep
                    ? "bg-medical-600 text-white"
                    : step < formStep
                      ? "bg-emerald-600 text-white"
                      : "bg-medical-100 text-medical-600"
                    }`}
                >
                  {step < formStep ? (
                    <LuCircleCheckBig className="w-4 h-4" />
                  ) : (
                    step
                  )}
                </div>
              ))}
            </div>
            <p className="text-medical-600 text-sm mt-2">
              Step {formStep} of 3
            </p>
          </div>

          {/* step 1 */}
          {formStep === 1 && (
            <div>
              <p className='text-medical-900 font-medium text-sm mb-4'>Select your role:</p>
              <div className='flex flex-col gap-4'>
                {roles.map((role) => (
                  <button key={role.id}
                    type='button'
                    onClick={() => {
                      setSelectedRole(role.id);
                      setFormData((prev) => ({
                        ...prev,
                        role: role.id
                      }));
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${selectedRole === role.id
                      ? "border-medical-300 bg-medical-50"
                      : "border-medical-100 hover:border-medical-200 bg-white"
                      }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedRole === role.id
                          ? `bg-gradient-to-br ${role.bgGradient}`
                          : `bg-${role.color}-100`
                          }`}
                      >
                        <role.icon
                          className={`w-5 h-5 ${selectedRole === role.id
                            ? "text-white"
                            : `text-${role.color}-600`
                            }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-medical-900">
                          {role.title}
                        </div>
                        <div className="text-sm text-medical-600 mb-2">
                          {role.desc}
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {role.requirements.map((req, index) => (
                            <span
                              key={index}
                              className="text-xs bg-medical-200 py-[2px] px-2 rounded-xl"
                            >
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* step 2 */}
          {formStep === 2 && (
            <div className='flex flex-col gap-4'>
              {/* full name */}
              <div className='flex flex-col gap-2 relative'>
                <LuUser className="absolute left-3 top-[60%] transform  text-medical-400 w-4 h-4" />
                <label className='text-medical-900 font-medium text-sm'>Full Name</label>
                <input name="name" type="text" placeholder='Enter your full name' className='pl-10 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2' value={formData.name} onChange={handleChange} />
              </div>

              <div className='flex items-center justify-between gap-3'>
                {/* email */}
                <div className='flex flex-col gap-2 relative w-full'>
                  <LuMail className="absolute left-3 top-[60%] transform  text-medical-400 w-4 h-4" />
                  <label className='text-medical-900 font-medium text-sm'>Email</label>
                  <input name="email" type="email" placeholder='your@email.com' className='w-full pl-10 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2' value={formData.email} onChange={handleChange} />
                </div>
                {/* phone */}
                <div className='flex flex-col gap-2 relative w-full'>
                  <LuPhone className="absolute left-3 top-[60%] transform  text-medical-400 w-4 h-4" />
                  <label className='text-medical-900 font-medium text-sm'>Phone</label>
                  <input name="phone" type="text" placeholder='+91 9876543210' className='w-full pl-10 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2' value={formData.phone} onChange={handleChange} />
                </div>
              </div>

              {/* password */}
              <div className='flex flex-col gap-2 relative w-full'>
                <LuLock className="absolute left-3 top-[60%] transform  text-medical-400 w-4 h-4" />
                <label className='text-medical-900 font-medium text-sm'>Password</label>
                <input name="password" type={showPassword ? "text" : "password"} placeholder='Create a strong password' className='w-full pl-10 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2' value={formData.password} onChange={handleChange} />
                {showPassword ?
                  <LuEyeOff onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[58%] transform text-medical-400 w-4 h-4 cursor-pointer" />
                  :
                  <LuEye onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[58%] transform text-medical-400 w-4 h-4 cursor-pointer" />
                }
              </div>

              {/* confirm password */}
              <div className='flex flex-col gap-2 relative w-full'>
                <LuLock className="absolute left-3 top-[60%] transform  text-medical-400 w-4 h-4" />
                <label className='text-medical-900 font-medium text-sm'>Confirm Password</label>
                <input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder='Confirm password' className='w-full pl-10 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2' value={formData.confirmPassword} onChange={handleChange} />
                {showConfirmPassword ?
                  <LuEyeOff onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[58%] transform text-medical-400 w-4 h-4 cursor-pointer" />
                  :
                  <LuEye onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[58%] transform text-medical-400 w-4 h-4 cursor-pointer" />
                }
              </div>

              {/* Password Requirements */}
              <div className="bg-medical-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-medical-900 mb-2">
                  Password Requirements:
                </h4>
                <div className="space-y-1 text-xs text-medical-700">
                  <div className="flex items-center space-x-2">
                    <LuCircleCheckBig className="w-3 h-3 text-emerald-600" />
                    <span>At least 8 characters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <LuCircleCheckBig className="w-3 h-3 text-emerald-600" />
                    <span>Include uppercase and lowercase</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <LuCircleCheckBig className="w-3 h-3 text-emerald-600" />
                    <span>Include numbers and symbols</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* step 3 */}
          {formStep === 3 && (
            <div>
              {selectedRole === "doctor" && (
                <div className='flex flex-col gap-4'>

                  <div className="flex flex-col gap-2 relative w-full">
                    <label className='text-medical-900 font-medium text-sm'>Medical Specialization</label>
                    <input
                      name="specialization"
                      placeholder="e.g., Cardiology, General Medicine"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="px-3 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2"
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <div className="flex flex-col gap-2 w-full">

                      <label className='text-medical-900 font-medium text-sm'>Medical License No.</label>
                      <input
                        name="medicalLicense"
                        placeholder="License number"
                        value={formData.medicalLicense}
                        onChange={handleChange}
                        className="px-3 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2 w-full"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2 w-full">

                      <label className='text-medical-900 font-medium text-sm'>Years of Experience</label>
                      <input
                        name="experience"
                        placeholder="e.g., 5"
                        value={formData.experience}
                        onChange={handleChange}
                        className="px-3 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2 w-full"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <div className="flex flex-col gap-2">
                  <label className='text-medical-900 font-medium text-sm'>{selectedRole === "doctor" || selectedRole === "admin"
                    ? "Hospital/Clinic"
                    : "Health Center"}
                  </label>

                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medical-400 w-4 h-4" />
                    <input
                      name="hospitalName"
                      placeholder={
                        selectedRole === "doctor"
                          ? "Hospital name"
                          : "Health center name"
                      }
                      value={formData.hospitalName}
                      onChange={handleChange}
                      className="pl-10 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2 w-full"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className='text-medical-900 font-medium text-sm'>Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medical-400 w-4 h-4" />
                    <input
                      name="location"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={handleChange}
                      className="pl-10 border border-medical-200 focus:border-medical-400 focus:outline-medical-400 rounded-md py-2"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-medical-50 p-4 rounded-lg mt-4">
                <label className="flex items-start space-x-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1 rounded border border-medical-300 text-medical-600 focus:ring-medical-500"
                    required
                  />
                  <span className="text-medical-700">
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="text-medical-600 hover:text-medical-800 underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-medical-600 hover:text-medical-800 underline"
                    >
                      Privacy Policy
                    </Link>
                    . I understand my credentials will be verified
                    before account activation.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* navigation buttons */}
          <div className='flex items-center justify-between'>
            {/* previous button */}
            {formStep > 1 && (
              <button type='button' className='border p-2 rounded-lg border-medical-300 text-medical-700 font-medium hover:bg-medical-100' onClick={handlePrev}>
                Previous
              </button>
            )}

            {/* next or submit button */}
            {formStep < 3 ?
              <button type='button' className='group relative ml-auto flex items-center gap-1 justify-center py-2 px-4 border border-transparent font-medium rounded-md text-white bg-gradient-to-r from-medical-600 to-emerald-600 hover:from-medical-700 hover:to-emerald-700' onClick={handleNext}>
                Next Step
                <TbCircleArrowRightFilled className='group-hover:translate-x-1 pt-[4px] text-xl transition-transform' />
              </button>
              :
              <>
                {loading ?
                  <span className='flex items-center justify-center py-3 px-4 border border-transparent font-medium rounded-md text-white bg-gradient-to-r from-medical-600 to-emerald-600 hover:from-medical-700 hover:to-emerald-700 w-2/6'>
                    <LuLoader className='animate-spin duration-1000 w-5 h-5' />
                  </span>
                  :
                  <button type='submit' className='group relative ml-auto flex items-center gap-1 justify-center py-2 px-4 border border-transparent font-medium rounded-md text-white bg-gradient-to-r from-medical-600 to-emerald-600 hover:from-medical-700 hover:to-emerald-700'>
                    Create Account
                    <LuCircleCheckBig className='group-hover:scale-110 pt-[4px] text-xl transition-transform' />
                  </button>
                }
              </>
            }
          </div>

          <div className="text-center text-sm text-medical-600 pt-4 border-t-2 border-medical-100">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-medical-600 hover:text-medical-800 font-medium transition-colors"
            >
              Sign in here
            </Link>
          </div>

          {/* <div className="flex flex-col gap-3 ">
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
          </div> */}
        </form>
      </div>
    </div>
  );
} 