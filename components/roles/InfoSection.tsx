interface InfoSectionProps {
  title: string;
  description: string;
}

export function InfoSection({ title, description }: InfoSectionProps) {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
}
