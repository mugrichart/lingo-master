import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

const ContentView = ({ children }: { children: React.ReactNode }) => {
  return (
    <ScrollArea className="overflow-hidden h-200">
      <div className='flex flex-row flex-wrap gap-6'>
        { children }
        <ScrollBar orientation='vertical' />
      </div>
    </ScrollArea>
  )
}

export default ContentView