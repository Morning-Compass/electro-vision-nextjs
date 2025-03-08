import ServiceOption from "./ServiceOption";

const serviceOptions = [
  { imageSrc: "/car.svg", alt: "Vehicle Tracking", text: "Vehicle Tracking" },
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

export default function ServiceOptions() {
  return (
    <div className="bg-blue-100 rounded-lg shadow-md p-6 flex-1">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Service Options
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {serviceOptions.map((option) => (
          <ServiceOption
            key={option.alt}
            imageSrc={option.imageSrc}
            alt={option.alt}
            text={option.text}
          />
        ))}
      </div>
    </div>
  );
}
