import axios from 'axios'
import React, { useState } from 'react'
import { FaArrowLeft } from "react-icons/fa"
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { serverUrl } from '../../App'
import { setLectureData } from '../../redux/lectureSlice'
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners'
function EditLecture() {
    const [loading,setLoading]= useState(false)
    const [loading1,setLoading1]= useState(false)
    const {courseId , lectureId} = useParams()
    const {lectureData} = useSelector(state=>state.lecture)
    const dispatch = useDispatch()
    const selectedLecture = lectureData.find(lecture => lecture._id === lectureId)
    const [videoFile,setVideoFile] = useState(null)
    const [videoLink,setVideoLink] = useState("")
    const [lectureTitle,setLectureTitle] = useState(selectedLecture.lectureTitle)
    const [isPreviewFree,setIsPreviewFree] = useState(!!selectedLecture.isPreviewFree)
    

    const editLecture = async () => {
      setLoading(true)
      try {
        if(!selectedLecture?.videoUrl && !videoFile && !videoLink.trim()){
          toast.error("Please upload a video or paste a video link")
          setLoading(false)
          return
        }

        const formData = new FormData()
        formData.append("lectureTitle", lectureTitle)
        formData.append("isPreviewFree", isPreviewFree)
        if(videoFile){
          formData.append("videoUrl", videoFile)
        }else if(videoLink.trim()){
          formData.append("videoUrl", videoLink.trim())
        }

        const result = await axios.post(serverUrl + `/api/course/editlecture/${lectureId}` , formData , {withCredentials:true})
        console.log(result.data)
        dispatch(setLectureData([...lectureData,result.data]))
        toast.success("Lecture Updated")
        navigate("/courses")
        setLoading(false)
      } catch (error) {
        console.log(error)
        toast.error(error.response.data.message)
        setLoading(false)
      }
    }

    const removeLecture = async () => {
      setLoading1(true)
      try {
        const result = await axios.delete(serverUrl + `/api/course/removelecture/${lectureId}` , {withCredentials:true})
        console.log(result.data)
        toast.success("Lecture Removed")
       navigate(`/createlecture/${courseId}`)
        setLoading1(false)
      } catch (error) {
        console.log(error)
        toast.error("Lecture remove error")
        setLoading1(false)
      }
      
    }






   

    

    const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6 space-y-6">

        {/* Header Inside Box */}
        <div className="flex items-center gap-2 mb-2">
          <FaArrowLeft className="text-gray-600 cursor-pointer" onClick={()=>navigate(`/createlecture/${courseId}`)} />
          <h2 className="text-xl font-semibold text-gray-800">Update Your Lecture</h2>
        </div>

        {/* Instruction */}
        <div>
         
          <button className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all text-sm" disabled={loading1} onClick={removeLecture}>
            {loading1?<ClipLoader size={30} color='white'/>:"Remove Lecture"}
          </button>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[black]focus:outline-none"
              placeholder={selectedLecture.lectureTitle}
              onChange={(e)=>setLectureTitle(e.target.value)}
              value={lectureTitle}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video *</label>
            {selectedLecture?.videoUrl ? (
              <p className="text-xs text-gray-500 mb-2">
                Current video:{" "}
                <a
                  href={selectedLecture.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline break-all"
                >
                  open
                </a>
              </p>
            ) : (
              <p className="text-xs text-gray-500 mb-2">No video uploaded yet.</p>
            )}
            <input
              type="file"
              accept='video/*'
              className="w-full border border-gray-300 rounded-md p-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-gray-700 file:text-[white] hover:file:bg-gray-500"
              onChange={(e)=>{
                setVideoFile(e.target.files?.[0] || null)
                setVideoLink("")
              }}
            />
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Or paste video link</label>
              <input
                type="url"
                className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[black] focus:outline-none"
                placeholder="https://..."
                value={videoLink}
                onChange={(e)=>{
                  setVideoLink(e.target.value)
                  setVideoFile(null)
                }}
              />
            </div>
          </div>

          {/* Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isPreviewFree}
              
              className="accent-[black] h-4 w-4"
              
              onChange={() => setIsPreviewFree(prev=>!prev)}
            />
            <label htmlFor="isFree" className="text-sm text-gray-700">Is this video FREE</label>
          </div>
        </div>
         <div>
          {loading ?<p>Uploading video... Please wait.</p>:""}
         </div>
        {/* Submit Button */}
        <div className="pt-4">
          <button className="w-full bg-black text-white py-3 rounded-md text-sm font-medium hover:bg-gray-700 transition" disabled={loading} onClick={editLecture}>
            {loading?<ClipLoader size={30} color='white'/> :"Update Lecture"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditLecture
