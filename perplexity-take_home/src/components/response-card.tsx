/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import { SourceList } from "./sources-list";
import { Source, Tweet } from "@/types/tweet";

interface ResponseCardProps {
  content: string;
  sources: any;
}

export function ResponseCard({ content, sources }: ResponseCardProps) {
  const formattedContent = content.split('\n').map((line, i) => {
    const parts = line.split(/(^@[^:]+:)/);
    return (
      <span key={i}>
        {parts.map((part, j) => 
          part.match(/^@[^:]+:/) ? 
            <a href={`https://x.com/${part.slice(1, -1)}`} target="_blank" rel="noopener noreferrer" key={j}>
              <strong>{part}</strong>
            </a> : 
            part
        )}
        {i < content.split('\n').length - 1 && <br />}
      </span>
    );
  });

  const sources_list: Source[] = []
  for (const source of sources) {
    const tweet: Tweet = {
      id: source.id,
      text: source.text,
      author: {
        name: source.author_name,
        username: source.author_handle
      },
      created_at: source.created_at
    }
    sources_list.push({
      url: source.url,
      tweet: tweet
    })
  }
  
  return (
    <Card className="border-0 bg-white/5 backdrop-blur-lg">
      <CardContent className="p-6">
      <SourceList sources={sources_list} />
      <br/>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 opacity-80">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-400"
          >
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <br/>
        <h2 className="text-gray-400 text-lg font-sans">Answer</h2>
        </div>
        <br/>
        <p className="text-white text-lg whitespace-pre-wrap font-sans">
          {formattedContent}
        </p>
      </CardContent>
    </Card>
  );
}