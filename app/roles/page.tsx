import { FooterSmall } from "@/components/templates/FooterSmall";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import PageTemplate from "@/components/templates/PageTemplate";
import FleetOverview from "@/components/roles/FleetOverview";
import ServiceOptions from "@/components/roles/ServiceOptions";

export default function Management() {
  return (
    <PageTemplate bgClass="bg-landing-gradient">
      <NavbarTemplate />
      <section className="flex flex-col items-center mt-auto mb-auto">
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
          <FleetOverview />
          <ServiceOptions />
        </div>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
