import { Card, CardHeader } from "@/components/ui/card";

interface QuestionCardProps {
  currentQuery: string;
}

export default function QuestionCard({ currentQuery }: QuestionCardProps) {
  return (
    <Card className="border-0 bg-white/5 backdrop-blur-lg">
      <CardHeader className="flex">
        <h2 className="text-3xl font-bold text-white">{currentQuery}</h2>
      </CardHeader>
    </Card>
  );
}

