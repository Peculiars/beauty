import { useState } from "react";

interface Address {
  phone: string | null;
  line1: string;
  city: string;
  state: string;
}

interface AddressEditorProps {
  documentId: string;
  documentType: string;
}

export function AddressEditor({ documentId, documentType }: AddressEditorProps) {
  const [address, setAddress] = useState<Address>({
    phone: null,
    line1: "",
    city: "",
    state: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to update the address in the database
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700">Phone</label>
        <input
          type="text"
          name="phone"
          value={address.phone || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-zinc-300 p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700">Address Line 1</label>
        <input
          type="text"
          name="line1"
          value={address.line1}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-zinc-300 p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700">City</label>
        <input
          type="text"
          name="city"
          value={address.city}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-zinc-300 p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700">State</label>
        <input
          type="text"
          name="state"
          value={address.state}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-zinc-300 p-2"
        />
      </div>
      <button type="submit" className="mt-4 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white">
        Save Address
      </button>
    </form>
  );
}