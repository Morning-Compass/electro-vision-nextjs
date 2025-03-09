import { FooterSmall } from "@/components/templates/FooterSmall";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import PageTemplate from "@/components/templates/PageTemplate";
import FleetOverview from "@/components/roles/fleet/Overview";
import ServiceOptions from "@/components/roles/ServiceOptions";

export default function FleetPage() {
  const managementOptions = [
    {
      imageSrc: "/car.svg",
      alt: "Vehicle Tracking",
      text: "Vehicle Tracking",
    },
    {
      imageSrc: "/tools.svg",
      alt: "Maintenance Alerts",
      text: "Maintenance Alerts",
    },
    {
      imageSrc: "/callendar.svg",
      alt: "Scheduled Services",
      text: "Scheduled Services",
    },
    {
      imageSrc: "/performance.svg",
      alt: "Performance Tracking",
      text: "Performance Tracking",
    },
  ];

  return (
    <PageTemplate bgClass="bg-landing-gradient">
      <NavbarTemplate />
      <section className="flex flex-col items-center mt-auto mb-auto">
        <section className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
          <FleetOverview />
          <ServiceOptions
            title="Fleet Management"
            options={managementOptions}
            className="bg-blue-100"
          />
        </section>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
