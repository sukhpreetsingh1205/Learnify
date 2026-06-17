import React, { useEffect, useRef, useState } from 'react'
import ai from "../assets/ai.png"
import ai1 from "../assets/SearchAi.png"
import { RiMicAiFill } from "react-icons/ri";
import axios from 'axios';
import { serverUrl } from '../App';
import { useNavigate } from 'react-router-dom';
import start from "../assets/start.mp3"
import { FaArrowLeftLong } from "react-icons/fa6";
import { toast } from 'react-toastify'
function SearchWithAi() {
  const [input, setInput] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [roadmap, setRoadmap] = useState('')
  const [listening,setListening] = useState(false)
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(true)
  const recognitionRef = useRef(null)
  const navigate = useNavigate();
  const startSound = new Audio(start)
  function speak(message) {
    let utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
  }

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSpeechSupported(false)
      recognitionRef.current = null
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.lang = navigator.language || 'en-US'

    recognitionRef.current = recognition

    return () => {
      try {
        recognition.onresult = null
        recognition.onerror = null
        recognition.onend = null
        recognition.abort()
      } catch (e) {
        // ignore
      } finally {
        recognitionRef.current = null
      }
    }
  }, [])

  const handleSearch = () => {

    const recognition = recognitionRef.current
    if (!recognition) {
      toast.error('Voice search is not supported in this browser.')
      return
    }

    if (listening) {
      try {
        recognition.stop()
      } catch (e) {
        // ignore
      }
      setListening(false)
      return
    }

    setListening(true)
    try {
      startSound.currentTime = 0
      startSound.play().catch(() => {})
    } catch (e) {
      // ignore autoplay errors
    }

    recognition.onresult = async (e) => {
      const transcript = e.results?.[0]?.[0]?.transcript?.trim()
      if (!transcript) return
      setInput(transcript)
      try {
        await handleRecommendation(transcript)
      } finally {
        try {
          recognition.stop()
        } catch (err) {
          // ignore
        }
      }
    }

    recognition.onerror = (e) => {
      setListening(false)
      const code = e?.error || 'unknown'
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        toast.error('Microphone permission blocked. Allow mic access and try again.')
        return
      }
      if (code === 'no-speech') {
        toast.info('No speech detected. Try again.')
        return
      }
      toast.error(`Voice search failed (${code}).`)
    }

    recognition.onend = () => {
      setListening(false)
    }

    try {
      recognition.start()
    } catch (e) {
      setListening(false)
      toast.error('Voice search could not start. Try again.')
    }
  
      
    
  };

  const handleRecommendation = async (query) => {
    try {
      setSearching(true)
      setHasSearched(true)
      setRoadmap('')
      setRecommendations([])

      const result = await axios.post(`${serverUrl}/api/ai/search`, { input: query }, { withCredentials: true });

      const payload = result?.data
      const courses = Array.isArray(payload) ? payload : payload?.courses
      const roadmapText = Array.isArray(payload) ? '' : payload?.roadmap

      setRoadmap(typeof roadmapText === 'string' ? roadmapText : '')
      setRecommendations(Array.isArray(courses) ? courses : [])

      if (Array.isArray(courses) && courses.length > 0) {
        speak("These are the top courses I found for you")
      } else {
        speak("No courses found")
      }
    } catch (error) {
      console.log(error);
    } finally {
      setListening(false)
      setSearching(false)
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex flex-col items-center px-4 py-16">
      
      {/* Search Container */}
      <div className="bg-white shadow-xl rounded-3xl p-6 sm:p-8 w-full max-w-2xl text-center relative">
        <FaArrowLeftLong  className='text-[black] w-[22px] h-[22px] cursor-pointer absolute' onClick={()=>navigate("/")}/>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-600 mb-6 flex items-center justify-center gap-2">
          <img src={ai} className='w-8 h-8 sm:w-[30px] sm:h-[30px]' alt="AI" />
          Search with <span className='text-[#CB99C7]'>AI</span>
        </h1>

        <div className="flex items-center bg-gray-700 rounded-full overflow-hidden shadow-lg relative w-full ">
          
          <input
            type="text"
            className="flex-grow px-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm sm:text-base"
            placeholder="What do you want to learn? (e.g. AI, MERN, Cloud...)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          
          
          {input && (
            <button
              onClick={() => handleRecommendation(input)}
              className="absolute right-14 sm:right-16 bg-white rounded-full"
            >
              <img src={ai} className='w-10 h-10 p-2 rounded-full' alt="Search" />
            </button>
          )}

          <button
            className="absolute right-2 bg-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleSearch}
            disabled={!speechSupported}
            aria-label={speechSupported ? 'Voice search' : 'Voice search not supported'}
          >
            <RiMicAiFill className="w-5 h-5 text-[#cb87c5]" />
          </button>
        </div>
      </div>

      {/* Roadmap + Recommendations */}
      {roadmap ? (
        <div className="w-full max-w-4xl mt-10 px-2 sm:px-4">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3">Roadmap</h2>
            <p className="text-sm sm:text-[15px] text-white/80 whitespace-pre-line leading-relaxed">{roadmap}</p>
          </div>
        </div>
      ) : null}

      {recommendations.length > 0 ? (
        <div className="w-full max-w-6xl mt-10 px-2 sm:px-4">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-white text-center flex items-center justify-center gap-3">
            <img src={ai1} className="w-10 h-10 sm:w-[60px] sm:h-[60px] p-2 rounded-full" alt="AI Results" />
            Courses
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {recommendations.map((course, index) => (
              <div
                key={index}
                className="bg-white text-black p-5 rounded-2xl shadow-md hover:shadow-indigo-500/30 transition-all duration-200 border border-gray-200 cursor-pointer hover:bg-gray-200"
                onClick={() => navigate(`/viewcourse/${course._id}`)}
              >
                <h3 className="text-lg font-bold sm:text-xl">{course.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{course.category}</p>
              </div>
            ))}
          </div>
        </div>
      ) : searching ? (
        <h1 className='text-center text-xl sm:text-2xl mt-10 text-gray-400'>Searching...</h1>
      ) : listening ? (
        <h1 className='text-center text-xl sm:text-2xl mt-10 text-gray-400'>Listening...</h1>
      ) : !hasSearched ? (
        <h1 className='text-center text-xl sm:text-2xl mt-10 text-gray-400'>Search a topic to see roadmap + courses</h1>
      ) : (
        <h1 className='text-center text-xl sm:text-2xl mt-10 text-gray-400'>No Courses Found</h1>
      )}
    </div>
  );
}

export default SearchWithAi;
