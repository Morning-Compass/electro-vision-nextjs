"use client";

import { Card } from "../Card";
import { InfoSection } from "../InfoSection";

const sections = [
  {
    title: "Task Management Panel",
    description: "Monitor work and manage tasks efficiently.",
  },
  {
    title: "Communication Tools",
    description:
      "Receive notifications, contact your team members, and communicate with customers.",
  },
];

export default function WorkerOverview() {
  return (
    <Card
      title="Worker Management"
      subtitle="Manage your work force efficiently."
    >
      {sections.map((section) => (
        <InfoSection
          key={section.title}
          title={section.title}
          description={section.description}
        />
      ))}
    </Card>
  );
}
