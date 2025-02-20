import * as React from "react";
import {
  format,
  subDays,
  startOfToday,
  endOfToday,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export default function DateFilter() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [fromDate, setFromDate] = React.useState<Date>(new Date());
  const [toDate, setToDate] = React.useState<Date>(new Date());
  const [selectedRange, setSelectedRange] = React.useState("Last 30 days");
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const ranges = [
    { label: "Today", value: "Today" },
    { label: "Yesterday", value: "Yesterday" },
    { label: "Last 7 days", value: "Last 7 days" },
    { label: "Last 30 days", value: "Last 30 days" },
    { label: "This Month", value: "This Month" },
    { label: "Previous Month", value: "Previous Month" },
    { label: "Last 90 days", value: "Last 90 days" },
  ];

  const handleRangeSelection = (rangeValue: string) => {
    const today = new Date();
    let newFromDate = new Date();
    let newToDate = new Date();

    switch (rangeValue) {
      case "Today":
        newFromDate = startOfToday();
        newToDate = endOfToday();
        break;
      case "Yesterday":
        newFromDate = subDays(startOfToday(), 1);
        newToDate = subDays(endOfToday(), 1);
        break;
      case "Last 7 days":
        newFromDate = subDays(startOfToday(), 7);
        newToDate = endOfToday();
        break;
      case "Last 30 days":
        newFromDate = subDays(startOfToday(), 30);
        newToDate = endOfToday();
        break;
      case "This Month":
        newFromDate = startOfMonth(today);
        newToDate = endOfMonth(today);
        break;
      case "Previous Month":
        newFromDate = startOfMonth(subMonths(today, 1));
        newToDate = endOfMonth(subMonths(today, 1));
        break;
      case "Last 90 days":
        newFromDate = subDays(startOfToday(), 90);
        newToDate = endOfToday();
        break;
      default:
        break;
    }

    setFromDate(newFromDate);
    setToDate(newToDate);
    setSelectedRange(rangeValue);
    setShowDatePicker(false);
  };

  const handleDateRangeChange = (ranges: any) => {
    setFromDate(ranges.selection.startDate);
    setToDate(ranges.selection.endDate);
    setSelectedRange("Custom Range");
  };

  const resetDates = () => {
    setFromDate(new Date());
    setToDate(new Date());
    setSelectedRange("Last 30 days");
    setShowDatePicker(false);
  };

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center justify-between gap-2 px-4 py-2 text-sm font-medium transition-colors border rounded-md border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
          Added Date
          <svg
            width="12"
            height="12"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transform transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <path
              d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="w-[520px] p-4 space-y-4 bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="flex flex-wrap gap-2">
          {ranges.map((range) => (
            <button
              key={range.value}
              onClick={() => handleRangeSelection(range.value)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
                ${
                  selectedRange === range.value
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          <div className="flex justify-between">
            <div>
              <label className="block text-sm text-gray-500 mb-1">From</label>
              <div className="relative">
                <input
                  type="text"
                  value={format(fromDate, "dd MMM yyyy")}
                  readOnly
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-[240px] px-4 py-2 text-sm border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">To</label>
              <div className="relative">
                <input
                  type="text"
                  value={format(toDate, "dd MMM yyyy")}
                  readOnly
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-[240px] px-4 py-2 text-sm border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {showDatePicker && (
            <DateRange
              editableDateInputs={true}
              onChange={handleDateRangeChange}
              moveRangeOnFirstSelection={false}
              ranges={[
                {
                  startDate: fromDate,
                  endDate: toDate,
                  key: "selection",
                },
              ]}
            />
          )}

          <div className="flex justify-between pt-2">
            <button
              onClick={resetDates}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Reset
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
            >
              Apply Now
            </button>
          </div>
        </div>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
