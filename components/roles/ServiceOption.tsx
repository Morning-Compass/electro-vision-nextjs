import Link from "next/link";

interface ServiceOptionProps {
  imageSrc: string;
  alt: string;
  text: string;
  href?: string;
}

export default function ServiceOption({
  imageSrc,
  alt,
  text,
  href,
}: ServiceOptionProps) {
  const Content = () => (
    <>
      <img src={imageSrc} alt={alt} className="w-12 h-12 mb-2" />
      <p className="text-gray-900">{text}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex flex-col items-center text-center hover:opacity-80 transition-opacity duration-200"
      >
        <Content />
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <Content />
    </div>
  );
}
