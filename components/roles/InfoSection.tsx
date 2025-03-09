interface InfoSectionProps {
  title: string;
  description: string;
  className?: string;
}

export function InfoSection({
  title,
  description,
  className,
}: InfoSectionProps) {
  return (
    <div className={`bg-gray-50 ${className || ""}`}>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
}
