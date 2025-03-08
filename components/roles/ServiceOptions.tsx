import ServiceOption from "./ServiceOption";

interface ServiceOptionItem {
  imageSrc: string;
  alt: string;
  text: string;
  link?: string;
}

interface ServiceOptionsProps {
  title?: string;
  options: ServiceOptionItem[];
  className?: string;
}

export default function ServiceOptions({
  title = "Service Options",
  options,
  className = "bg-blue-100",
}: ServiceOptionsProps) {
  return (
    <div className={`${className} rounded-lg shadow-md p-6 flex-1`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {options.map((option) => (
          <ServiceOption
            key={option.alt}
            imageSrc={option.imageSrc}
            alt={option.alt}
            text={option.text}
            href={option.link}
          />
        ))}
      </div>
    </div>
  );
}
