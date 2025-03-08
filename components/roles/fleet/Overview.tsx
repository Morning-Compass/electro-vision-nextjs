"use client";

import { Card } from "../Card";
import { InfoSection } from "../InfoSection";

const fleetSections = [
  {
    title: "Vehicle Tracking",
    description: "Monitor the location and status of each vehicle.",
  },
  {
    title: "Maintenance Alerts",
    description: "Receive notifications for scheduled maintenance.",
  },
  {
    title: "Fuel Management",
    description: "Track and optimize fuel consumption across your fleet.",
  },
  {
    title: "Performance Analytics",
    description: "Analyze vehicle performance and driver behavior data.",
  },
];

export default function FleetOverview() {
  return (
    <Card
      title="Fleet Overview"
      subtitle="Manage your fleet of vehicles efficiently."
    >
      {fleetSections.map((section) => (
        <InfoSection
          key={section.title}
          title={section.title}
          description={section.description}
        />
      ))}
    </Card>
  );
}
