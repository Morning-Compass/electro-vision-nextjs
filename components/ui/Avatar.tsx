import Image from "next/image";

type AvatarSize = "xs" | "sm" | "md" | "lg";

type AvatarProps = {
  src?: string | null;
  name?: string | null;
  size?: AvatarSize;
  className?: string;
};

const sizes: Record<AvatarSize, { container: string; text: string; img: number }> = {
  xs: { container: "w-6 h-6", text: "text-[10px]", img: 24 },
  sm: { container: "w-8 h-8", text: "text-xs", img: 32 },
  md: { container: "w-10 h-10", text: "text-sm", img: 40 },
  lg: { container: "w-12 h-12", text: "text-base", img: 48 },
};

function getInitials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase();
}

export default function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  const { container, text, img } = sizes[size];

  if (src) {
    return (
      <div
        className={`${container} rounded-full overflow-hidden flex-shrink-0 border border-ev-stroke ${className}`}
      >
        <Image
          src={src}
          alt={name ?? "avatar"}
          width={img}
          height={img}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${container} rounded-full bg-ev-yellow/20 border border-ev-yellow/30 flex items-center justify-center flex-shrink-0 ${className}`}
    >
      <span className={`${text} font-semibold text-ev-yellow`}>
        {getInitials(name)}
      </span>
    </div>
  );
}
