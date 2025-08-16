"use client"
import Loading from "@/app/courses/[programId]/[moduleId]/[topicId]/loading"
import { useEffect, useRef, useState } from "react"
import { useAuth, User } from "@/contexts/auth-context"
import VideoPlayer from "./videoPlayer"
import DocumentViewer from "./documentViewer"
import { toast } from "./ui/use-toast"
import { CheckCircle } from "lucide-react"
import { Resource } from "@/lib/generated/prisma"


export default function TopicResourceRenderer({ topicId, topics, moduleId, resource, resources }: { topicId: string, topics: number[], moduleId: string, resource: Resource, resources: any }) {
  const [markdownContent, setMarkdownContent] = useState<string | null>(null)
  const [markedCompleted, setMarkedCompleted] = useState(false)
  const countResource = useRef<number>(0)
  const { user, setUser/*, refreshUser*/ } = useAuth();
  let completedTopics = user!.completedTopics
  let completedModules = user!.completedModules
  let completedResources = user!.completedResources


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
    let flag1 = false, flag2 = false, flag3 = false;
    if (!completedResources[Number(resource.id)]) {
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

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error);
        }

        countResource.current += 1;
        flag1 = true;
        toast({
          title: "Progress marked",
          description: (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>This resource is marked as completed</span>
            </div>
          ),
        });

        // ✅ Now perform topic completion
        if (resources.length <= countResource.current && !completedTopics[Number(topicId)]) {
          let id1=Number(resource.id)
          let temp = {...completedResources}
          temp[id1]=true
          const allResourcesCompleted = resources.every((prop: any) =>
            temp[prop.resource.id]
          );

          if (allResourcesCompleted) {
            const res = await fetch("/student/progress", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                learnerId: user!.id,
                topicId,
                progressType: "topic",
                status: "Completed",
              }),
            });

            const data = await res.json();
            if (!res.ok) {
              throw new Error(data.error);
            }
            flag2 = true;
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
        if (!completedModules[Number(moduleId)]) {
          let temp ={...completedModules}
          temp[Number(moduleId)]=true;
         
          const allTopicsCompleted = topics.every((topic) =>
            temp[topic]
          );

          if (allTopicsCompleted) {
            const res = await fetch("/student/progress", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                learnerId: user!.id,
                moduleId,
                progressType: "module",
                status: "Completed",
              }),
            });

            const data = await res.json();
            if (!res.ok) {
              throw new Error(data.error);
            }
            flag3 = true;
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
        let updatedUser:User;
        if (flag1 && flag2 && flag3) {

          updatedUser={ ...user!, completedResources: {...completedResources, [resource.id]:true}, completedTopics: {...completedTopics, [Number(topicId)]:true}, completedModules: {...completedModules, [Number(moduleId)]:true} }
          

        } else if (flag1 && flag2) {
          updatedUser={...user!, completedResources: {...completedResources, [resource.id]:true}, completedTopics: {...completedTopics, [Number(topicId)]:true}}
      
        } else if (flag1) {
          updatedUser={...user!, completedResources: {...completedResources, [resource.id]:true}}
        }
        setUser(updatedUser!)
        localStorage.setItem('eduportal-user',JSON.stringify(updatedUser!))

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
            markedCompleted={markedCompleted} />
        ) : (
          <Loading />
        )}
      </div>
    )
  }

  if (completedResources[resource.id]) {
    countResource.current = countResource.current + 1;

  }

  if (resource.resourceType === "video") {
    return (
      <div className="w-full">
        <VideoPlayer
          src={resource.url}
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


