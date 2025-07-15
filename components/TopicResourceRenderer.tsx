"use client"
import Loading from "@/app/courses/[programId]/[moduleId]/[topicId]/loading"
import { RefObject, useEffect, useRef, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import VideoPlayer from "./videoPlayer"
import DocumentViewer from "./documentViewer"
import { toast } from "./ui/use-toast"
import { CheckCircle } from "lucide-react"
import { Resource } from "@/lib/generated/prisma"


export default function TopicResourceRenderer({ topicId,  topics, moduleId, resource, resources }: { topicId: string,  topics: number[], moduleId: string, resource: Resource, resources: any }) {
  const [markdownContent, setMarkdownContent] = useState<string | null>(null)
  const [markedCompleted, setMarkedCompleted] = useState(false)
  const countResource = useRef<number>(0)
  const { user, refreshUser } = useAuth();
  const completedTopics = new Set(user?.completedTopics || []);
  const completedModules = new Set(user?.completedModules || []);
  const completedResources = new Set(user?.completedResources || []);
  

  useEffect(() => {
    if (resource.resourceType === "document") {
      fetch(resource.url)
        .then((res) => res.text())
        .then((text) => setMarkdownContent(text))
        .catch((err) => {
          console.error("Failed to fetch markdown:", err);
          throw new Error();
        })
    }
  }, [resource])


  const handleMarkProgress = async () => {
    setMarkedCompleted(true);
    if (!completedResources.has(resource.id)) {
      try {
        const res = await fetch("/student/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            learnerId: user!.id,
            resourceId: resource.id,
            progressType: "resource",
            status: "Completed",
          }),
        });

        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }

        countResource.current += 1;

        toast({
          title: "Progress marked",
          description: (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>This resource is marked as completed</span>
            </div>
          ),
        });

        // ✅ Get updated user directly


        // ✅ Now perform topic completion
        if (resources.length <= countResource.current && !completedTopics.has(Number(topicId))) {
          // const updatedUser = await refreshUser();
          // if (!updatedUser) { console.log('user could not be refreshed'); return };
          const temp = [...completedResources, resource.id]
          const allResourcesCompleted = resources.every((prop: any) =>
            temp.includes(prop.resource.id)
          );

          if (allResourcesCompleted) {
            await fetch("/student/progress", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                learnerId: user!.id,
                topicId,
                progressType: "topic",
                status: "Completed",
              }),
            });

            toast({
              title: "Progress marked",
              description: (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Congratulations! you have completed the topic</span>
                </div>
              ),
            });
          }
        }

        // ✅ Now check module completion
        if (!completedModules.has(Number(moduleId))) {
          console.log('last topic in module')
          const temp = [...completedTopics, Number(topicId)]
          const allTopicsCompleted = topics.every((topic) =>
            temp.includes(topic)
          );

          if (allTopicsCompleted) {
            console.log('all topics completed');
            await fetch("/student/progress", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                learnerId: user!.id,
                moduleId,
                progressType: "module",
                status: "Completed",
              }),
            });

            toast({
              title: "Progress marked",
              description: (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Congratulations! you have completed the module</span>
                </div>
              ),
            });
          }
        }
        refreshUser();
      } catch (error: any) {
        setMarkedCompleted(false);
        toast({
          title: "Failed",
          description: error.message || "Something went wrong.",
          variant: "destructive",
        });
        console.error("Error in handleMarkProgress:", error);
      }
    }
  };



  if (resource.resourceType === "document") {
    return (
      <div className="prose max-w-none">
        {markdownContent ? (
          <DocumentViewer content={markdownContent} handleMarkProgress={handleMarkProgress} id={resource.id} completedResources={completedResources} 
                            markedCompleted={markedCompleted}/>
        ) : (
          <Loading />
        )}
      </div>
    )
  }

  if (completedResources.has(resource.id)) {
    countResource.current = countResource.current + 1;

  }

  if (resource.resourceType === "video") {
    return (
      <div className="w-full">
        <VideoPlayer
          src="/videos/random.mp4"
          handleMarkProgress={handleMarkProgress} id={resource.id} completedResources={completedResources}
        />
      </div>
    )
  }

  if (resource.resourceType === "image") {
    return (
      <div className="w-full flex justify-center">
        <img src={resource.url} alt="Resource" className="max-w-full max-h-[80vh] rounded shadow" />
      </div>
    )
  }

  return (
    <div className="text-muted-foreground">
      Unsupported resource type: {resource.resourceType}
    </div>
  )
}


