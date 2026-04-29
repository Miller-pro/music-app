import Link from "next/link";
import { CodeSnippet } from "../onboarding/CodeSnippet";

export function AdsTxtLineDisplay({ line }: { line: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="av-label mb-0">Your ads.txt line</span>
        <Link href="/docs#ads-txt" className="text-xs text-primary hover:underline">
          How to add this →
        </Link>
      </div>
      <CodeSnippet language="text" label="ads.txt" code={line} />
    </div>
  );
}
