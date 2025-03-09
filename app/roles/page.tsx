"use client";

import { Card } from "@/components/roles/Card";
import { InfoSection } from "@/components/roles/InfoSection";
import ServiceOption from "@/components/roles/ServiceOption";
import ServiceOptions from "@/components/roles/ServiceOptions";
import { FooterSmall } from "@/components/templates/FooterSmall";
import NavbarTemplate from "@/components/templates/NavbarTemplate";
import PageTemplate from "@/components/templates/PageTemplate";

const infoSections = [
  {
    title: "Worker Management",
    subtitle: "Manage your work force efficiently.",
    description: "Description of Worker Management",
  },
  {
    title: "Worker Management",
    subtitle: "Manage your work force efficiently.",
    description: "Description of Worker Management",
  },
];

const serviceSections = [
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

export default function Home() {
  return (
    <PageTemplate bgClass="bg-landing-gradient">
      <NavbarTemplate />
      <Card
        title="Management Panel"
        subtitle="Manage your work force efficiently."
        className={"w-[50vw]"}
      >
        {infoSections.map((section) => (
          <InfoSection
            key={section.title}
            title={section.title}
            description={section.description}
            className={"w-[40%]"}
          />
        ))}
        <ServiceOptions
          title="Task management"
          options={serviceSections}
          className="bg-blue-100"
        />
      </Card>
      <FooterSmall />
    </PageTemplate>
  );
}
