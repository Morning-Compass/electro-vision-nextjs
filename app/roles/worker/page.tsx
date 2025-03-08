import { FooterSmall } from "@/components/templates/FooterSmall";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import PageTemplate from "@/components/templates/PageTemplate";
import WorkerOverview from "@/components/roles/worker/Overview";
import ServiceOptions from "@/components/roles/ServiceOptions";
import Link from "next/link";

export default function Management() {
  const managementOptions = [
    {
      imageSrc: "/tasks.svg",
      alt: "Assign tasks and track progress.",
      text: "Task Management Panel",
      link: "/roles/fleet/",
    },
    {
      imageSrc: "/communication.svg",
      alt: "Communication Tools",
      text: "Communication Tools",
      link: "/roles/communication/",
    },
  ];

  return (
    <PageTemplate bgClass="bg-landing-gradient">
      <NavbarTemplate />
      <section className="flex flex-col items-center mt-auto mb-auto">
        <section className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
          <WorkerOverview />
          <ServiceOptions
            title="Task management"
            options={managementOptions}
            className="bg-blue-100"
          />
        </section>
      </section>
      <FooterSmall />
    </PageTemplate>
  );
}
