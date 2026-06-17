import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Course from "../models/courseModel.js";
dotenv.config();


export const searchWithAi = async (req,res) => {

    try {
         const { input } = req.body;
     
    if (!input || !String(input).trim()) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const query = String(input).trim()
 // case-insensitive
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const classificationPrompt=`You are an intelligent assistant for an LMS platform. A user will type any query about what they want to learn. Your task is to understand the intent and return one **most relevant keyword** from the following list of course categories and levels:

- App Development  
- AI/ML  
- AI Tools  
- Data Science  
- Data Analytics  
- Ethical Hacking  
- UI UX Designing  
- Web Development  
- Others  
- Beginner  
- Intermediate  
- Advanced  

Only reply with one single keyword from the list above that best matches the query. Do not explain anything. No extra text.

Query: ${query}
`

const roadmapPrompt = `You are a senior instructor for an LMS platform.
Create a clear, beginner-friendly but complete learning roadmap for: "${query}".
Return plain text with short headings and bullet points.
Order:
1) Prerequisites
2) Step-by-step roadmap (8–12 steps)
3) Practice projects (3–6 ideas)
4) Milestones / how to know you're ready
Keep it concise (max ~450 words).`

  const settled = await Promise.allSettled([
    ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: classificationPrompt,
    }),
    ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: roadmapPrompt,
    }),
  ])

  const classificationResponse = settled[0].status === "fulfilled" ? settled[0].value : null
  const roadmapResponse = settled[1].status === "fulfilled" ? settled[1].value : null

  const keyword = String(classificationResponse?.text || "").trim()
  const roadmap = String(roadmapResponse?.text || "").trim()



    let courses = await Course.find({
      isPublished: true,
     $or: [
    { title: { $regex: query, $options: 'i' } },
    { subTitle: { $regex: query, $options: 'i' } },
    { description: { $regex: query, $options: 'i' } },
    { category: { $regex: query, $options: 'i' } },
    { level: { $regex: query, $options: 'i' } }
  ]
    });

    if(courses.length === 0 && keyword){
       courses = await Course.find({
      isPublished: true,
     $or: [
    { title: { $regex: keyword, $options: 'i' } },
    { subTitle: { $regex: keyword, $options: 'i' } },
    { description: { $regex: keyword, $options: 'i' } },
    { category: { $regex: keyword, $options: 'i' } },
    { level: { $regex: keyword, $options: 'i' } }
  ]
    });
    }

    return res.status(200).json({ roadmap, keyword, courses });


    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "AI search failed" });
    }
}
