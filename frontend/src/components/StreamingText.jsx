export default function StreamingText({ text, isStreaming }) {
  return (
    <span className="font-mono whitespace-pre-wrap">
      {text}
      {isStreaming && <span className="streaming-cursor">|</span>}
    </span>
  );
}
