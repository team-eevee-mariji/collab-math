type WaitingStatusProps = { count?: number };

export default function WaitingStatus({ count = 1 }: WaitingStatusProps) {
  return (
    <p className="mcg-waiting">
      <span className="mcg-waiting-pill">
        {count} player{count === 1 ? "" : "s"} is waiting
      </span>
    </p>
  );
}
