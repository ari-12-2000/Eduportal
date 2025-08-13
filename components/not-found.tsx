"use client";

import { ArrowLeft, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
const NotFound = ({ resource }: { resource: string }) => {
    const router = useRouter();
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
            <div className="max-w-md mx-auto px-4 py-8 text-center">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{resource} Not Found</h1>
                    <p className="text-gray-600 mb-6">The {resource} you're looking for doesn't exist or couldn't be loaded.</p>
                    <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
                        Retry
                    </Button>
                    <ArrowLeft className="h-4 w-4 mr-2" onClick={() => resource == 'course' ? router.push('/courses/search') : router.back()} />
                </div>
            </div>
        </div>
    )
}

export default NotFound