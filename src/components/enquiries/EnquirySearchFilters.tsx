import { Search } from "lucide-react";

interface EnquirySearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
}

export default function EnquirySearchFilters({
  searchQuery,
  onSearchChange,
  onSearch,
}: EnquirySearchFiltersProps) {
  return (
    <div className="m-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search Bar - Full width on mobile, 1/2 on desktop */}
        <div className="w-full sm:w-[400px]">
          <div className="flex items-center rounded-full border border-[#E5E7EB] bg-white pr-1">
            <input
              className="flex-1 border-none outline-none bg-transparent px-4 py-2 rounded-l-full"
              placeholder="Search by Company Name ... "
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
            />
            <button
              onClick={onSearch}
              className="p-2 bg-[#FF6644] rounded-full"
            >
              <Search color="#ffffff" width="16" height="16" />
            </button>
          </div>
        </div>

        {/* Filter Buttons - Center aligned on mobile, right on desktop */}
        <div className="flex justify-center sm:justify-end gap-2 sm:gap-3">
          <button className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white hover:bg-gray-50">
            Products
          </button>
          <button className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white hover:bg-gray-50">
            Assigned
          </button>
          <button className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white hover:bg-gray-50">
            Enquiry Date
          </button>
        </div>
      </div>
    </div>
  );
}
