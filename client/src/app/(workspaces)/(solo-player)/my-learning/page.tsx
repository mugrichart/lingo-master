import Link from "next/link"
import { fetchMyLearning } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, ClipboardCheck, BookOpen } from "lucide-react"

const MyLearningPage = async () => {
  const learning = await fetchMyLearning()

  return (
    <div className="w-full h-full pl-4 flex flex-col gap-6 py-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <BookOpen /> My Learning
        </h1>
        <p className="text-sm text-muted-foreground">
          Topics you've completed the learn loop for. Revise them or test your mastery.
        </p>
      </div>

      {learning.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <GraduationCap size={40} className="text-muted-foreground" />
              <p className="text-muted-foreground">
                You haven't completed any topic yet. Head to a topic and hit <span className="font-semibold text-foreground">Learn</span> to get started.
              </p>
              <Link href="/topics">
                <Button>Browse topics</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6">
          {learning.map(item => (
            <Card key={item._id} className="p-3 justify-between w-80">
              <div className="w-full flex justify-between items-start">
                <div className="flex flex-col">
                  <Link href={`/topics/${item.topic._id}?tab=words`} className="font-semibold hover:underline">
                    {item.topic.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">{item.topic.language}</span>
                </div>
                <Badge variant={item.topicLevel >= 100 ? 'default' : 'secondary'}>
                  Mastery: {item.topicLevel}%
                </Badge>
              </div>
              <CardContent className="px-0 pt-2 text-sm text-muted-foreground">
                {item.topic.words.length} word{item.topic.words.length === 1 ? '' : 's'}
                {item.learnedAt && <> · learned {new Date(item.learnedAt).toLocaleDateString()}</>}
              </CardContent>
              <div className="flex gap-2">
                <Link href={`/topics/learn?topic=${item.topic._id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <GraduationCap /> Revise
                  </Button>
                </Link>
                <Link href={`/topics/test?topic=${item.topic._id}`} className="flex-1">
                  <Button className="w-full">
                    <ClipboardCheck /> Test
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyLearningPage
