import Image from "next/image";
import Input from "./Input";

type WorkerEntryProps = {
  username: string;
  photo: string | null;
  id: number;
};

export default function WorkerEntry({ username, photo, id }: WorkerEntryProps) {
  return (
    <>
      <div className="flex justify-between items-center gap-4 flex-row">
        <Image
          src={photo ?? "/employee.png"}
          alt="Employee"
          width={56}
          height={56}
          className="rounded-full"
        />
        <p className="text-2xl">{username}</p>
        <p className="text-2xl">{id}</p>
        <Input
          name="details"
          type="button"
          value="Details"
          className="px-4 py-2 bg-ev-blue text-white rounded-lg hover:scale-110 duration-300"
        />
      </div>
    </>
  );
}
