/**
 * Opening hours from Settings. Parts separated by "·" each get their own
 * line, so a narrow screen never breaks a line in the middle of a part
 * ("Mon–Fri, 8:30 AM – 6:00 PM · Sat & Sun closed" -> two lines).
 */
export function OpeningHours({ value }: { value: string }) {
  const parts = value
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return <>{value}</>;
  return (
    <span className="hours">
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 ? <span className="visually-hidden">, </span> : null}
          {part}
        </span>
      ))}
    </span>
  );
}
