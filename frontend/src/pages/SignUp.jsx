import React, { useMemo, useState } from 'react'
import learnifyLogo from '../assets/learnify.png'
import google from '../assets/google.jpg'
import axios from 'axios'
import { serverUrl } from '../App'
import { MdOutlineRemoveRedEye, MdRemoveRedEye } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../../utils/Firebase'
import { ClipLoader } from 'react-spinners'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'
function SignUp() {
    const [name,setName]= useState("")
    const [email,setEmail]= useState("")
    const [password,setPassword]= useState("")
    const [role,setRole]= useState("student")
    const navigate = useNavigate()
    let [show,setShow] = useState(false)
    const [loading,setLoading]= useState(false)
    let dispatch = useDispatch()

    const roleOptions = useMemo(
        () => [
            { value: 'student', label: 'Student' },
            { value: 'educator', label: 'Educator' },
        ],
        []
    )

    const handleSignUp = async () => {
        setLoading(true)
        try {
            const result = await axios.post(serverUrl + "/api/auth/signup" , {name , email , password , role} , {withCredentials:true} )
            dispatch(setUserData(result.data))

            navigate("/")
            toast.success("SignUp Successfully")
            setLoading(false)
        } 
        catch (error) {
            console.log(error)
            setLoading(false)
            toast.error(error.response.data.message)
        }
        
    }
    const googleSignUp = async () => {
        try {
            const response = await signInWithPopup(auth,provider)
            console.log(response)
            let user = response.user
            let name = user.displayName;
            let email=user.email
            
            
            const result = await axios.post(serverUrl + "/api/auth/googlesignup" , {name , email ,role}
                , {withCredentials:true}
            )
            dispatch(setUserData(result.data))
            navigate("/")
            toast.success("SignUp Successfully")
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message)
        }
        
    }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4 py-10 flex items-center justify-center">
        <form
            className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5 grid md:grid-cols-2"
            onSubmit={(e) => {
                e.preventDefault()
                handleSignUp()
            }}
        >
            <div className="p-6 sm:p-10 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    <img src={learnifyLogo} alt="Learnify" className="h-10 w-10 rounded-lg object-contain ring-1 ring-black/10" />
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
                        <p className="text-sm text-gray-500">Start learning and track your progress.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            autoComplete="name"
                            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/20"
                            placeholder="Your name"
                            onChange={(e)=>setName(e.target.value)}
                            value={name}
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/20"
                            placeholder="you@example.com"
                            onChange={(e)=>setEmail(e.target.value)}
                            value={email}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="mt-1 relative">
                            <input
                                id="password"
                                type={show ? "text" : "password"}
                                autoComplete="new-password"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-11 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/20"
                                placeholder="Create a strong password"
                                onChange={(e)=>setPassword(e.target.value)}
                                value={password}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                                onClick={()=>setShow(prev => !prev)}
                                aria-label={show ? "Hide password" : "Show password"}
                            >
                                {show ? <MdRemoveRedEye className="h-5 w-5" /> : <MdOutlineRemoveRedEye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">I am joining as</p>
                    <div className="inline-flex rounded-xl bg-gray-100 p-1 ring-1 ring-gray-200">
                        {roleOptions.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                className={`px-4 py-2 text-sm rounded-lg transition ${
                                    role === opt.value
                                        ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                                aria-pressed={role === opt.value}
                                onClick={()=>setRole(opt.value)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full h-11 rounded-lg bg-black text-white font-medium flex items-center justify-center gap-2 transition hover:bg-[#2b2b2b] disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? <ClipLoader size={22} color="white" /> : "Sign Up"}
                </button>

                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200" />
                    <div className="text-xs text-gray-500">OR</div>
                    <div className="h-px flex-1 bg-gray-200" />
                </div>

                <button
                    type="button"
                    className="w-full h-11 rounded-lg border border-gray-300 bg-white flex items-center justify-center gap-2 font-medium text-gray-800 transition hover:bg-gray-50"
                    onClick={googleSignUp}
                >
                    <img src={google} alt="" className="h-5 w-5 object-contain" />
                    Continue with Google
                </button>

                <div className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <span className="font-medium text-gray-900 underline underline-offset-2 cursor-pointer" onClick={()=>navigate("/login")}>
                        Login
                    </span>
                </div>
            </div>

            <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-black to-[#1f1f1f] text-white">
                <div>
                    <p className="text-sm text-white/70">Learnify LMS</p>
                    <h2 className="mt-2 text-3xl font-semibold leading-tight">
                        Build skills.<br />Track progress.<br />Stay consistent.
                    </h2>
                    <p className="mt-4 text-sm text-white/70">
                        Join as a student or educator and get started in minutes.
                    </p>
                </div>

                <div className="flex items-center justify-center">
                    <img src={learnifyLogo} className="w-[260px] max-w-full drop-shadow-2xl" alt="Learnify" />
                </div>

                <div className="text-xs text-white/50">
                    By signing up, you agree to our terms and privacy policy.
                </div>
            </div>
        </form>
    </div>
  )
}

export default SignUp
