import { Text } from "@radix-ui/themes";
import { useSearchParams } from "react-router";

interface StatusCount {
  status: string;
  label: string;
  statusCount: number;
}

interface StatusFilterCardsProps {
  statusList: StatusCount[];
  selectedStatus: string;
}

const DEFAULT_PAGE_NUMBER = 0;

const CARD_STYLES = {
  default: {
    border: "1px solid #E5E7EB",
    backgroundColor: "white",
    color: "#111827",
  },
  selected: {
    border: "1px solid #B7AEFF",
    backgroundColor: "#F3F2FF",
    color: "#6600FF",
  },
};

export default function StatusFilterCards({
  statusList,
  selectedStatus,
}: StatusFilterCardsProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleStatusClick = (status: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("filter", `SALES_ENQUIRY_STATUS:${status}`);
    newParams.set("pageNumber", DEFAULT_PAGE_NUMBER.toString());
    newParams.set("query", "");
    setSearchParams(newParams);
  };

  return (
    <div className="overflow-x-auto scrollbar-hide scroll-container">
      <div className="flex px-3 gap-4 whitespace-nowrap pb-1">
        {statusList.map((status) => {
          const isSelected = selectedStatus === status.status;
          const styles = isSelected
            ? CARD_STYLES.selected
            : CARD_STYLES.default;

          return (
            <div
              key={status.status}
              className="min-w-[160px] rounded-lg p-3 cursor-pointer"
              style={{
                ...styles,
              }}
              onClick={() => handleStatusClick(status.status)}
              role="button"
              aria-pressed={isSelected}
              tabIndex={0}
            >
              <Text
                as="p"
                weight="medium"
                style={{ color: styles.color }}
                className="mb-2"
              >
                {status.label}
              </Text>
              <Text
                as="p"
                weight="bold"
                style={{ color: styles.color }}
                size="5"
              >
                {status.statusCount}
              </Text>
            </div>
          );
        })}
      </div>
    </div>
  );
}
