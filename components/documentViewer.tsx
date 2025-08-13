import { BookOpen, Check } from 'lucide-react'
import React, {useState } from 'react'
import ReactMarkdown from "react-markdown"
const DocumentViewer = ({ content, handleMarkProgress, id, completedResources, markedCompleted}: { content: string | null, handleMarkProgress: () => Promise<void>, id:number, completedResources:{ [key: number]:boolean}, markedCompleted:boolean}) => {
    const markProgress = () => {
        if (!markedCompleted) {
            handleMarkProgress()
        }
    }
    
    return (
    <>
      <ReactMarkdown>{content as string}</ReactMarkdown>
      <button 
        className={`
                    mt-6 px-6 py-3 
                    font-semibold text-white 
                    rounded-lg shadow-lg 
                    transform transition-all duration-200 ease-in-out
                    flex items-center gap-2 justify-center
                    ${
                      (markedCompleted ||  completedResources[id])
                        ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
                        : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-200"
                    }
                    hover:shadow-xl hover:-translate-y-0.5
                    active:transform active:scale-95
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                    focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50
                `}
        onClick={markProgress}
        disabled={(markedCompleted ||  completedResources[id])}
      >
        {(markedCompleted ||  completedResources[id]) ?(
          <>
            <Check className="w-5 h-5" />
            Completed
          </>
        ) : (
          <>
            <BookOpen className="w-5 h-5" />
            Mark as Read
          </>
        )}
      </button>
    </>
  )
}

export default DocumentViewer