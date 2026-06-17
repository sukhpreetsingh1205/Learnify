import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import axios from 'axios'
import { setCreatorCourseData } from '../redux/courseSlice'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

const getCreatorCourseData = () => {
    const dispatch = useDispatch()
    const {userData} = useSelector(state=>state.user)

    useEffect(()=>{
      if(!userData || userData?.role !== "educator"){
        dispatch(setCreatorCourseData([]))
        return
      }

      const getCreatorData = async () => {
        try {
          const result = await axios.get(serverUrl + "/api/course/getcreatorcourses" , {withCredentials:true})
          dispatch(setCreatorCourseData(result.data))
        } catch (error) {
          console.log(error)
          toast.error(error?.response?.data?.message || "Failed to load creator courses")
        }
      }

      getCreatorData()
    },[userData, dispatch])
}

export default getCreatorCourseData
