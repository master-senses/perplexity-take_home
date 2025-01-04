import { Sparkles } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface QuestionCardProps {
  currentQuery: string;
}

export default function QuestionCard({ currentQuery }: QuestionCardProps) {
    console.log(currentQuery)
  return (
    <Card className="border-0 bg-white/5 backdrop-blur-lg">
      <CardHeader className="flex">
        <h2 className="text-2xl font-semibold text-white">{currentQuery}</h2>
      </CardHeader>
      {/* <CardContent>
        <div className="space-y-2">
          <div className="space-y-1">
            <button className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white">
              Search for common issues and solutions
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white">
              Look for documentation or guides
            </button>
          </div>
        </div>
      </CardContent> */}
    </Card>
  );
}

