import Input from "@/components/Input";
import Image from "next/image";

export type CalendarButtonProps = {
  className?: string;
};

function CalendarButton({ className }: CalendarButtonProps) {
  return (
    <section className={`flex flex-row ${className}`}>
      <Image
        src={"/calendar.svg"}
        alt={"calendar icon"}
        width={28}
        height={28}
        className={`object-contain mr-4`}
      />
      <Input
        type="date"
        name="calendar"
        className="border-4 bg-gray-200 text-black border-solid rounded-[0.9rem] max-w-[10rem] min-w-20 w-[10vw] max-h-12 min-h-8 h-[10vh] pl-4 pr-4 duration-300"
      />
    </section>
  );
}

export default CalendarButton;
