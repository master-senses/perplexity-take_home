import { Card, CardContent } from "@/components/ui/card";

interface ResponseCardProps {
  content: string;
}

export function ResponseCard({ content }: ResponseCardProps) {
  return (
    <Card className="border-0 bg-white/5 backdrop-blur-lg">
      <CardContent className="p-6">
        <p className="text-white text-lg">{content}</p>
      </CardContent>
    </Card>
  );
} 