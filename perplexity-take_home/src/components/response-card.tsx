import { Card, CardContent } from "@/components/ui/card";
  
interface ResponseCardProps {
  content: string;
}

export function ResponseCard({ content }: ResponseCardProps) {
  const formattedContent = content.split('\n').map((line, i) => (
    <span key={i}>
      {line}
      {i < content.split('\n').length - 1 && <br />}
    </span>
  ));
  
  return (
    <Card className="border-0 bg-white/5 backdrop-blur-lg">
      <CardContent className="p-6">
        <p className="text-white text-lg whitespace-pre-wrap">
          {formattedContent}
        </p>
      </CardContent>
    </Card>
  );
}