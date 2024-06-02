import NavbarTemplate from "@/components/templates/NavbarTemplate";
import PageTemplate from "@/components/templates/PageTemplate";

export default function Home() {
  return (
    <PageTemplate>
      <section className="flex flex-col items-center ">
        <NavbarTemplate />
        Morning Compass
      </section>
    </PageTemplate>
  );
}
