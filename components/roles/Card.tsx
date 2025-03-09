interface CardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, subtitle, children, className }: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 flex-1 ${className || ""}`}
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      <p className="text-gray-600 mb-6">{subtitle}</p>
      <div className="flex flex-row justify-around">{children}</div>
    </div>
  );
}
