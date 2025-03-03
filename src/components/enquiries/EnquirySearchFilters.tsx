import { Button } from "@radix-ui/themes";
import { Calendar, ChevronDown, Search, X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import { useState, useRef, useEffect } from "react";

interface EnquirySearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  startDate: Date | null;
  endDate: Date | null;
}

interface QuickFiltersProps {
  onQuickFilter: (days: number) => void;
  onMonthFilter: () => void;
  onPreviousMonth: () => void;
}

interface DateInputProps
  extends Omit<React.ComponentProps<typeof DatePicker>, "onChange"> {
  label: string;
  isMobile?: boolean;
  onChange: (date: Date) => void;
}

export default function EnquirySearchFilters({
  searchQuery,
  onSearchChange,
  onSearch,
  onDateRangeChange,
  startDate,
  endDate,
}: EnquirySearchFiltersProps) {
  // Applied dates shown in the button
  const [appliedStartDate, setAppliedStartDate] = useState<Date | null>(
    startDate
  );
  const [appliedEndDate, setAppliedEndDate] = useState<Date | null>(endDate);

  // Temporary dates used in the modal
  const [modalStartDate, setModalStartDate] = useState<Date | null>(startDate);
  const [modalEndDate, setModalEndDate] = useState<Date | null>(endDate);

  // Sync with parent state when it changes
  useEffect(() => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setModalStartDate(startDate);
    setModalEndDate(endDate);
  }, [startDate, endDate]);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Handle body scroll lock for mobile
  useEffect(() => {
    if (isDatePickerOpen) {
      // Lock scrolling on mobile
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";

      return () => {
        // Restore scrolling when component unmounts or modal closes
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isDatePickerOpen]);

  // Handle click outside for desktop view
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if clicking on date picker elements
      const isDatePickerElement =
        event.target instanceof Element &&
        (event.target.closest(".react-datepicker") ||
          event.target.closest(".react-datepicker-wrapper") ||
          event.target.closest(".react-datepicker-popper"));

      if (isDatePickerElement) return;

      // Close if clicking outside the date picker modal
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        handleCloseModal();
      }
    };

    if (isDatePickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDatePickerOpen]);

  const handleOpenModal = () => {
    // Initialize modal dates with currently applied dates
    setModalStartDate(appliedStartDate);
    setModalEndDate(appliedEndDate);
    setIsDatePickerOpen(true);
  };

  const handleCloseModal = () => {
    setIsDatePickerOpen(false);
    // Reset modal dates
    setModalStartDate(appliedStartDate);
    setModalEndDate(appliedEndDate);
  };

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!modalStartDate || !modalEndDate) {
      return;
    }

    // Update both local and parent state
    setAppliedStartDate(modalStartDate);
    setAppliedEndDate(modalEndDate);
    onDateRangeChange(modalStartDate, modalEndDate);
    setIsDatePickerOpen(false);
  };

  const handleQuickFilter = (days: number) => {
    const end = new Date();
    const start = dayjs().subtract(days, "day").toDate();

    // Update modal dates
    setModalStartDate(start);
    setModalEndDate(end);
  };

  const handleMonthFilter = (type: "this" | "previous") => {
    const now = new Date();
    const start =
      type === "this"
        ? new Date(now.getFullYear(), now.getMonth(), 1)
        : new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end =
      type === "this" ? now : new Date(now.getFullYear(), now.getMonth(), 0);
    setModalStartDate(start);
    setModalEndDate(end);
  };

  const handleReset = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Clear both applied and modal dates
    setAppliedStartDate(null);
    setAppliedEndDate(null);
    setModalStartDate(null);
    setModalEndDate(null);
    onDateRangeChange(null, null);

    if (isDatePickerOpen) {
      setIsDatePickerOpen(false);
    }
  };

  return (
    <div className="w-full">
      {/* DatePicker Styles */}
      <DatePickerStyles />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search Bar */}
        <div className="p-3 w-full sm:w-[400px] relative">
          <div className="flex items-center rounded-full border border-gray-200 bg-white pr-1">
            <input
              className="flex-1 border-none outline-none bg-transparent px-4 py-2 rounded-l-full text-sm placeholder-gray-400"
              placeholder="Search by Company Name..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              aria-label="Search companies"
            />
            <button
              onClick={onSearch}
              className="p-2 bg-[#FF6644] rounded-full hover:bg-[#E65532] transition-colors"
              aria-label="Search"
              type="button"
            >
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center sm:justify-end gap-2 sm:gap-3">
          <Button variant="outline" className="gap-1 bg-white font-medium">
            Products <ChevronDown className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            onClick={handleOpenModal}
            className={`gap-2 font-medium min-w-[140px] ${
              appliedStartDate && appliedEndDate ? "bg-purple-50" : ""
            }`}
            aria-haspopup="dialog"
            aria-expanded={isDatePickerOpen}
          >
            {appliedStartDate && appliedEndDate ? (
              <>
                <span className="truncate">
                  {dayjs(appliedStartDate).format("DD MMM YYYY")} -{" "}
                  {dayjs(appliedEndDate).format("DD MMM YYYY")}
                </span>
                <button
                  className="flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  aria-label="Clear date filter"
                  type="button"
                >
                  <X className="w-3.5 h-3.5 text-gray-500 hover:text-gray-700" />
                </button>
              </>
            ) : (
              <>
                Enquiry Date
                <ChevronDown className="w-3 h-3" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Date Picker Modal */}
      {isDatePickerOpen && (
        <>
          {/* Mobile Overlay */}
          <div className="sm:hidden fixed inset-0 bg-black/30 z-50">
            <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-white">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setIsDatePickerOpen(false)}
                    className="text-gray-600 flex items-center gap-1"
                    aria-label="Close date picker"
                    type="button"
                  >
                    <X className="w-5 h-5" />
                    <span className="font-medium">Close</span>
                  </button>
                  <span className="text-gray-900 font-semibold">
                    Select Date Range
                  </span>
                  <div className="w-9" />
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto pb-[env(safe-area-inset-bottom,16px)]">
                <div className="mb-6 -mx-1">
                  <div className="overflow-x-auto py-1 px-1">
                    <QuickFilters
                      onQuickFilter={handleQuickFilter}
                      onMonthFilter={() => handleMonthFilter("this")}
                      onPreviousMonth={() => handleMonthFilter("previous")}
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <DateInput
                    label="From"
                    selected={modalStartDate}
                    onChange={(date: Date) => setModalStartDate(date)}
                    maxDate={modalEndDate || undefined}
                    isMobile={true}
                    aria-label="Start date"
                  />
                  <DateInput
                    label="To"
                    selected={modalEndDate}
                    onChange={(date: Date) => setModalEndDate(date)}
                    minDate={modalStartDate || undefined}
                    maxDate={new Date()}
                    isMobile={true}
                    aria-label="End date"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-white pb-[env(safe-area-inset-bottom,16px)]">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors font-medium text-base"
                    aria-label="Clear dates"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={!modalStartDate || !modalEndDate}
                    className="flex-[2] py-3 bg-[#6600FF] text-white rounded-lg hover:bg-[#5500DD] active:bg-[#4400CC] transition-colors font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-disabled={!modalStartDate || !modalEndDate}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Popup */}
          <div className="hidden sm:block">
            <div
              ref={datePickerRef}
              className="absolute right-0 mt-2 bg-white rounded-xl shadow-xl w-full max-w-[480px] z-50 border border-gray-100"
              role="dialog"
              aria-modal="true"
              aria-label="Date range picker"
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">
                    Select Date Range
                  </h3>
                  <button
                    onClick={() => setIsDatePickerOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close date picker"
                    type="button"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <QuickFilters
                  onQuickFilter={handleQuickFilter}
                  onMonthFilter={() => handleMonthFilter("this")}
                  onPreviousMonth={() => handleMonthFilter("previous")}
                />

                <div className="grid grid-cols-2 gap-4 my-6">
                  <DateInput
                    label="From"
                    selected={modalStartDate}
                    onChange={(date: Date) => setModalStartDate(date)}
                    maxDate={modalEndDate || undefined}
                    aria-label="Start date"
                  />
                  <DateInput
                    label="To"
                    selected={modalEndDate}
                    onChange={(date: Date) => setModalEndDate(date)}
                    minDate={modalStartDate || undefined}
                    maxDate={new Date()}
                    aria-label="End date"
                  />
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <button
                    onClick={handleReset}
                    className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg"
                    type="button"
                  >
                    Clear Dates
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApply}
                      disabled={!modalStartDate || !modalEndDate}
                      className="px-4 py-2 text-sm text-white bg-[#6600FF] hover:bg-[#5500DD] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      type="button"
                      aria-disabled={!modalStartDate || !modalEndDate}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const QuickFilters = ({
  onQuickFilter,
  onMonthFilter,
  onPreviousMonth,
}: QuickFiltersProps) => (
  <div className="flex flex-wrap gap-2">
    {[
      { label: "Today", action: () => onQuickFilter(0) },
      { label: "Yesterday", action: () => onQuickFilter(1) },
      { label: "Last 7 Days", action: () => onQuickFilter(7) },
      { label: "Last 30 Days", action: () => onQuickFilter(30) },
      { label: "This Month", action: onMonthFilter },
      { label: "Previous Month", action: onPreviousMonth },
      { label: "Last 90 Days", action: () => onQuickFilter(90) },
    ].map((filter) => (
      <button
        key={filter.label}
        onClick={filter.action}
        className="px-4 py-2 text-sm rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
        type="button"
      >
        {filter.label}
      </button>
    ))}
  </div>
);

const DateInput = ({ label, isMobile = false, ...props }: DateInputProps) => (
  <div className="relative">
    <label className="block text-sm text-gray-700 mb-2 font-medium">
      {label}
    </label>
    <div className="relative flex items-center">
      <DatePicker
        className={`w-full text-[15px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
          isMobile ? "p-4 pr-12" : "h-10 px-3"
        }`}
        dateFormat="dd MMM yyyy"
        placeholderText="Select date"
        showPopperArrow={false}
        popperModifiers={[
          {
            name: "preventOverflow",
            options: {
              padding: 16,
            },
          },
          {
            name: "flip",
            options: {
              fallbackPlacements: ["top"],
            },
          },
        ]}
        popperPlacement="bottom-start"
        {...props}
      />
      <div
        className={`absolute pointer-events-none ${
          isMobile ? "right-4" : "right-3"
        }`}
        aria-hidden="true"
      >
        <Calendar
          className={`text-gray-400 ${isMobile ? "w-6 h-6" : "w-4 h-4"}`}
        />
      </div>
    </div>
  </div>
);

// Encapsulate DatePicker styles in a React component
const DatePickerStyles = () => (
  <style jsx global>{`
    .react-datepicker-wrapper {
      width: 100%;
    }
    .react-datepicker-popper {
      z-index: 60 !important;
    }
    .react-datepicker {
      font-family: inherit !important;
      border-color: #e5e7eb !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      border-radius: 0.5rem !important;
    }
    .react-datepicker__header {
      background: white !important;
      border-bottom: 1px solid #e5e7eb !important;
      padding-top: 1rem !important;
      border-top-left-radius: 0.5rem !important;
      border-top-right-radius: 0.5rem !important;
    }
    .react-datepicker__current-month {
      font-size: 1rem !important;
      font-weight: 600 !important;
      color: #111827 !important;
    }
    .react-datepicker__day-name {
      color: #6b7280 !important;
      font-weight: 500 !important;
      width: 2.5rem !important;
      line-height: 2.5rem !important;
      margin: 0.2rem !important;
    }
    .react-datepicker__day {
      width: 2.5rem !important;
      line-height: 2.5rem !important;
      margin: 0.2rem !important;
      border-radius: 9999px !important;
      color: #374151 !important;
    }
    .react-datepicker__day:hover {
      background-color: #f3f4f6 !important;
    }
    .react-datepicker__day--selected {
      background-color: #6600ff !important;
      color: white !important;
    }
    .react-datepicker__day--keyboard-selected {
      background-color: #6600ff !important;
      color: white !important;
    }
    .react-datepicker__day--in-selecting-range,
    .react-datepicker__day--in-range {
      background-color: rgba(102, 0, 255, 0.1) !important;
      color: #374151 !important;
    }
    .react-datepicker__day--disabled {
      color: #d1d5db !important;
    }
    .react-datepicker__navigation {
      top: 1rem !important;
    }
    .react-datepicker__navigation--previous {
      left: 1rem !important;
    }
    .react-datepicker__navigation--next {
      right: 1rem !important;
    }
    @media (max-width: 640px) {
      .react-datepicker__day-name,
      .react-datepicker__day {
        width: 2.25rem !important;
        line-height: 2.25rem !important;
        margin: 0.2rem !important;
        font-size: 0.875rem !important;
      }
      .react-datepicker__current-month {
        font-size: 1rem !important;
      }
    }
  `}</style>
);
