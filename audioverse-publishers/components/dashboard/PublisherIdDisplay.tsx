import { CopyButton } from "../ui/CopyButton";

export function PublisherIdDisplay({ publisherId }: { publisherId: string }) {
  return (
    <div>
      <span className="av-label">Publisher ID</span>
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-bg px-3 py-2">
        <code className="flex-1 font-mono text-primary">{publisherId}</code>
        <CopyButton text={publisherId} size="sm" />
      </div>
    </div>
  );
}
