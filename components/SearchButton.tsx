import Input from "@/components/Input";
import Image from "next/image";

export type SearchButtonProps = {
  className?: string;
  text?: string;
};

function SearchButton({ className, text }: SearchButtonProps) {
  return (
    <section className={`flex flex-row ${className}`}>
      <Image
        src={"/search.svg"}
        alt={"search icon"}
        width={28}
        height={28}
        className={`object-contain mr-4`}
      />
      <Input
        type="text"
        name="search"
        className="border-4 bg-ev-primary-bg text-ev-text border-solid rounded-[0.9rem] max-w-[20rem] min-w-40 w-[20vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300"
        placeholder={text ?? "search..."}
      />
    </section>
  );
}

export default SearchButton;
