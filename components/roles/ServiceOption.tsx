interface ServiceOptionProps {
  imageSrc: string;
  alt: string;
  text: string;
}

export default function ServiceOption({
  imageSrc,
  alt,
  text,
}: ServiceOptionProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <img src={imageSrc} alt={alt} className="w-12 h-12 mb-2" />
      <p className="text-gray-900">{text}</p>
    </div>
  );
}
