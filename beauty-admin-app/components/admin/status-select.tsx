import { useState } from "react";

interface StatusSelectProps {
  documentId: string;
  documentType: string;
}

const statuses = [
  { value: "pending", label: "Pending" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "canceled", label: "Canceled" },
];

export function StatusSelect({ documentId, documentType }: StatusSelectProps) {
  const [selectedStatus, setSelectedStatus] = useState(statuses[0].value);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value);
    // Add logic to update the status in the backend
  };

  return (
    <select
      value={selectedStatus}
      onChange={handleChange}
      className="border border-zinc-300 rounded-md p-2"
    >
      {statuses.map((status) => (
        <option key={status.value} value={status.value}>
          {status.label}
        </option>
      ))}
    </select>
  );
}