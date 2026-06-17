import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCertificate, FaClock, FaGraduationCap, FaHeadset, FaWandMagicSparkles } from 'react-icons/fa6'

import Nav from '../components/Nav'
import Logos from '../components/Logos'
import ExploreCourses from '../components/ExploreCourses'
import Cardspage from '../components/Cardspage'
import About from '../components/About'
import ReviewPage from '../components/ReviewPage'
import Footer from '../components/Footer'

import heroStudent from '../assets/about.jpg'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="w-[100%] overflow-hidden bg-white">
      <div className="w-[100%] relative bg-gradient-to-br from-[#05050a] via-[#070712] to-[#0b071a]">
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[280px] -left-[280px] h-[620px] w-[620px] rounded-full bg-violet-600/25 blur-3xl" />
          <div className="absolute top-[120px] right-[-320px] h-[720px] w-[720px] rounded-full bg-violet-700/30 blur-3xl" />
          <div className="absolute bottom-[-300px] left-[20%] h-[680px] w-[680px] rounded-full bg-indigo-500/15 blur-3xl" />
        </div>

        <Nav />

        <div className="relative mx-auto max-w-[1200px] px-4 pt-[120px] pb-[60px]">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="text-violet-400 text-[14px] font-semibold tracking-wide">
                Anywhere Access Easy Learning
              </div>

              <h1 className="mt-4 text-[34px] md:text-[52px] font-bold leading-tight">
                The Best <span className="text-violet-400">Platform</span> For Enhancing Skills
              </h1>

              <p className="mt-4 text-[15px] md:text-[16px] text-white/75 max-w-[560px]">
                Learn from structured courses, track progress, and build real-world skills with practical lessons, projects, and instructor guidance.
              </p>

              <div className="mt-7 flex items-center gap-3 flex-wrap">
                <button
                  className="px-[22px] py-[12px] rounded-[12px] bg-violet-600 text-white text-[16px] font-medium hover:bg-violet-700 transition"
                  onClick={() => navigate('/allcourses')}
                >
                  Get Started
                </button>
                <button
                  className="px-[22px] py-[12px] rounded-[12px] border border-white/25 text-white text-[16px] font-medium hover:bg-white/10 transition flex items-center gap-2"
                  onClick={() => navigate('/searchwithai')}
                >
                  AI Search <FaWandMagicSparkles className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-[680px]">
                <div className="bg-white/10 text-white rounded-xl px-4 py-4 shadow-md ring-1 ring-white/10 backdrop-blur">
                  <FaGraduationCap className="w-6 h-6" />
                  <div className="mt-3 text-[13px] font-medium">Skilled Instructors</div>
                </div>
                <div className="bg-white/10 text-white rounded-xl px-4 py-4 shadow-md ring-1 ring-white/10 backdrop-blur">
                  <FaClock className="w-6 h-6" />
                  <div className="mt-3 text-[13px] font-medium">Flexible Learning</div>
                </div>
                <div className="bg-white/10 text-white rounded-xl px-4 py-4 shadow-md ring-1 ring-white/10 backdrop-blur">
                  <FaHeadset className="w-6 h-6" />
                  <div className="mt-3 text-[13px] font-medium">24/7 Support</div>
                </div>
                <div className="bg-white/10 text-white rounded-xl px-4 py-4 shadow-md ring-1 ring-white/10 backdrop-blur">
                  <FaCertificate className="w-6 h-6" />
                  <div className="mt-3 text-[13px] font-medium">Certification</div>
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-center lg:justify-end">
              <div
                aria-hidden="true"
                className="absolute -inset-10 bg-violet-700/70 rotate-6 hidden sm:block"
                style={{ borderRadius: '42% 58% 52% 48% / 48% 45% 55% 52%' }}
              />
              <div className="relative w-[320px] sm:w-[420px]">
                <img
                  src={heroStudent}
                  alt=""
                  className="w-full h-[420px] object-cover rounded-[28px] shadow-2xl ring-1 ring-black/10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Logos />
      <ExploreCourses />
      <Cardspage />
      <div id="about" className="scroll-mt-24">
        <About />
      </div>
      <ReviewPage />
      <Footer />
    </div>
  )
}

export default Home
