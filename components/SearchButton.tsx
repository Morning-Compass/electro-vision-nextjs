import Input from "@/components/Input";
import Image from "next/image";

export type SearchButtonProps = {
  className?: string;
};

function SearchButton({ className }: SearchButtonProps) {
  return (
    <section className={`flex flex-row ${className}`}>
      <Image
        src={"/search.svg"}
        alt={"search icon"}
        width={28}
        height={28}
        className={`object-contain`}
      />
      <Input
        type="text"
        name="search"
        className="border-4 bg-mc-white text-black border-solid rounded-[0.9rem] max-w-[20rem] min-w-40 w-[20vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300"
      />
    </section>
  );
}

export default SearchButton;
