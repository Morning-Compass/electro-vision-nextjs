export default function FleetOverview() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex-1">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Fleet Overview
      </h2>
      <p className="text-gray-600 mb-6">
        Manage your fleet of vehicles efficiently.
      </p>
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Vehicle Tracking
          </h3>
          <p className="text-gray-500">
            Monitor the location and status of each vehicle.
          </p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Maintenance Alerts
          </h3>
          <p className="text-gray-500">
            Receive notifications for scheduled maintenance.
          </p>
        </div>
      </div>
    </div>
  );
}
