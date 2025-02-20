import {
  Badge,
  Box,
  Card,
  DataList,
  Flex,
  Button,
  IconButton,
  Text,
  TextField,
  Separator,
  Checkbox,
  DropdownMenu,
  Dialog,
} from "@radix-ui/themes";
import { Check, Download, MapPin, Search, UserPlus, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { useEffect, useState, useCallback, useMemo } from "react";
import apiList from "../../api/api";
import { formatTimestamp, timeAgo } from "../../utils/Commons";
import ReactPaginate from "react-paginate";
import NoResultFound from "@/assets/image/no-result-found.webp";
import DateFilter from "./DateFilter";

// Constants
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PAGE_NUMBER = 0;
const DEFAULT_FILTER = "SALES_ENQUIRY_STATUS:PENDING";

// Interfaces
interface StatusCount {
  status: string;
  label: string;
  statusCount: number;
}

interface Enquiry {
  salesEnquiryId: string;
  buyerDto: {
    companyName: string;
    state: string;
  };
  enquiryStatus: string;
  dateCreated: string;
  expDeliveryDate: string;
  lineItemDtoList: Array<{
    id: string;
    quantity: number;
    unit: string;
    productName: string;
  }>;
  pocInfo?: {
    fullName: string;
  };
}

interface Employee {
  dateCreated: number;
  lastModified: number;
  createdBy: string;
  lastModifiedBy: string;
  organisationId: string;
  employeeId: string;
  fullName: string;
  emails: string[];
  mobileNumber: string;
  loginEmail: string;
  department: string;
  employeeCode: string;
  status: string | null;
  meta: any | null; // Can be more specific if you know its structure
  primary: boolean;
  deleted: boolean;
}

interface pocInfo {
  pocName: string;
  emailAddresses: string[];
  mobileNumbers: string[];
  pocId: string;
}

export default function EnquiryList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [statusList, setStatusList] = useState<StatusCount[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(DEFAULT_PAGE_NUMBER);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEnquiries, setSelectedEnquiries] = useState<string[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    "REJECTED" | "ACCEPTED" | "ASSIGNED" | "QUOTED" | "QUOTE_ACCEPTED" | null
  >(null);
  const [remark, setRemark] = useState("");

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const [employeeList, setEmployeeList] = useState<Employee[]>([]);

  // Fetch status counts
  const fetchStatusCounts = useCallback(async () => {
    try {
      const response = await apiList.getStatusCount("714361434540086498");
      setStatusList(response?.data || []);
    } catch (err) {
      console.error("Failed to fetch status count ", err);
      toast.error("Failed to fetch status counts");
    }
  }, []);

  // Fetch enquiries data
  const fetchEnquiriesData = useCallback(async () => {
    try {
      const params = {
        query: searchParams.get("query") || "",
        filter: searchParams.get("filter") || DEFAULT_FILTER,
        pageNumber:
          searchParams.get("pageNumber") || DEFAULT_PAGE_NUMBER.toString(),
        pageSize: searchParams.get("pageSize") || DEFAULT_PAGE_SIZE.toString(),
      };

      const data = await apiList.getEnquiries("714361434540086498", params);
      setEnquiries(data.data.content);
      setTotalPages(data.data.totalPages);
      setCurrentPage(data.data.pageable.pageNumber);
      setSelectedEnquiries([]); // Clear selected enquiries on data load
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      toast.error("Failed to fetch enquiries");
    }
  }, [searchParams]);

  // Handle status change for an enquiry
  const handleStatusChange = useCallback(
    async (enquiryId: string, status: string) => {
      try {
        await apiList.updateEnquiryStatus(
          "714361434540086498",
          enquiryId,
          status,
          ""
        );
        toast.success("Enquiry status updated successfully");
        fetchEnquiriesData();
        fetchStatusCounts();
        setSelectedEnquiries([]); // Clear selected enquiries on status change
      } catch (error) {
        console.error("Error updating enquiry status:", error);
        toast.error("Failed to update enquiry status");
      }
    },
    [fetchEnquiriesData, fetchStatusCounts]
  );

  // Handle bulk status change for selected enquiries
  const handleBulkStatusChange = useCallback(
    async (
      selectedEmployee: Employee | null,
      status: string,
      remarks: string
    ) => {
      const pocInfo: pocInfo = {
        pocName: selectedEmployee?.fullName || "",
        emailAddresses: selectedEmployee?.emails || [""],
        mobileNumbers: [selectedEmployee?.mobileNumber || ""],
        pocId: selectedEmployee?.employeeId || "",
      };

      try {
        const data = await apiList.enquiryBulkAction(
          "714361434540086498",
          selectedEnquiries,
          pocInfo,
          status,
          remarks
        );

        toast.success(`Enquiries ${status.toLowerCase()} successfully`);
        fetchEnquiriesData();
        fetchStatusCounts();
        setSelectedEnquiries([]); // Clear selected enquiries after bulk action
      } catch (error) {
        console.error(`Error ${status.toLowerCase()} enquiries:`, error);
        toast.error(`Failed to ${status.toLowerCase()} enquiries`);
      }
    },
    [selectedEnquiries, fetchEnquiriesData, fetchStatusCounts]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (event: { selected: number }) => {
      const newPageNumber = event.selected;
      const newParams = new URLSearchParams(searchParams);
      newParams.set("pageNumber", newPageNumber.toString());
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Handle search
  const handleSearch = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("query", searchQuery);
    newParams.set("pageNumber", DEFAULT_PAGE_NUMBER.toString());
    setSearchParams(newParams, { replace: true });
  }, [searchQuery, searchParams, setSearchParams]);

  // Set default parameters and fetch data
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);

    if (!searchParams.has("filter")) {
      newParams.set("filter", DEFAULT_FILTER);
    }
    if (!searchParams.has("pageNumber")) {
      newParams.set("pageNumber", DEFAULT_PAGE_NUMBER.toString());
    }
    if (!searchParams.has("pageSize")) {
      newParams.set("pageSize", DEFAULT_PAGE_SIZE.toString());
    }

    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams, { replace: true });
    }

    if (newParams.get("filter")?.startsWith("SALES_ENQUIRY_STATUS:")) {
      const status = newParams.get("filter")?.split(":")[1];
      const query = newParams.get("query") || "";
      setSelectedStatus(status || "");
      setSearchQuery(query);
      fetchEnquiriesData();
      fetchStatusCounts();
    }
  }, [searchParams, setSearchParams, fetchEnquiriesData, fetchStatusCounts]);

  // Handle "Select All" checkbox
  const handleSelectAll = useCallback(() => {
    if (selectedEnquiries.length === enquiries.length) {
      // If all are selected, deselect all
      setSelectedEnquiries([]);
    } else {
      // Select all enquiries on the current page
      setSelectedEnquiries(enquiries.map((enquiry) => enquiry.salesEnquiryId));
    }
  }, [enquiries, selectedEnquiries]);

  // Handle individual enquiry selection
  const handleEnquirySelection = useCallback(
    (enquiryId: string) => {
      if (selectedEnquiries.includes(enquiryId)) {
        // Deselect the enquiry
        setSelectedEnquiries((prev) => prev.filter((id) => id !== enquiryId));
      } else {
        // Select the enquiry
        setSelectedEnquiries((prev) => [...prev, enquiryId]);
      }
    },
    [selectedEnquiries]
  );

  // Memoized status filter cards
  const statusFilterCards = useMemo(
    () =>
      statusList &&
      statusList.map((status) => (
        <Box minWidth="160px" key={status.status}>
          <Card
            className="p-3 shadow-lg"
            style={{
              border:
                selectedStatus === status.status ? "1px solid #B7AEFF" : "none",
              backgroundColor:
                selectedStatus === status.status ? "#F3F2FF" : "white",
            }}
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set("filter", `SALES_ENQUIRY_STATUS:${status.status}`);
              newParams.set("pageNumber", DEFAULT_PAGE_NUMBER.toString());
              setSearchParams(newParams);
            }}
          >
            <Text
              as="p"
              weight="medium"
              style={{
                color: selectedStatus === status.status ? "#6600FF" : "#000",
              }}
            >
              {status.label}
            </Text>
            <Text
              as="p"
              weight="bold"
              style={{
                color: selectedStatus === status.status ? "#6600FF" : "#000",
              }}
            >
              {status.statusCount}
            </Text>
          </Card>
        </Box>
      )),
    [statusList, selectedStatus, searchParams, setSearchParams]
  );

  //create bulk acton component

  const renderBulkActions = () => {
    switch (selectedStatus) {
      case "PENDING":
        return (
          <>
            <Button
              variant="outline"
              size="1"
              onClick={() => {
                setSelectedAction("REJECTED");
                setIsDialogOpen(true);
              }}
            >
              <X /> Reject
            </Button>
            <Button
              variant="solid"
              size="1"
              onClick={() => {
                setSelectedAction("ACCEPTED");
                setIsDialogOpen(true);
              }}
            >
              <Check /> Accept
            </Button>
          </>
        );
      case "ACCEPTED":
        return (
          <>
            <Button
              variant="outline"
              size="1"
              onClick={() => {
                setSelectedAction("REJECTED");
                setIsDialogOpen(true);
              }}
            >
              <X width={16} height={16} /> Reject
            </Button>
            <Button
              variant="solid"
              size="1"
              onClick={() => {
                setSelectedAction("ASSIGNED");
                setIsDialogOpen(true);
              }}
            >
              <UserPlus width={16} height={16} />
              Assign
            </Button>
          </>
        );
      case "ASSIGNED":
        return (
          <>
            <Button
              variant="outline"
              size="1"
              onClick={() => {
                setSelectedAction("REJECTED");
                setIsDialogOpen(true);
              }}
            >
              <X width={16} height={16} /> Reject
            </Button>
            <Button
              variant="solid"
              size="1"
              onClick={() => {
                setSelectedAction("QUOTED");
                setIsDialogOpen(true);
              }}
            >
              Quoted
            </Button>
          </>
        );
      case "QUOTED":
        return (
          <>
            <Button
              variant="outline"
              size="1"
              onClick={() => {
                setSelectedAction("REJECTED");
                setIsDialogOpen(true);
              }}
            >
              <X width={16} height={16} /> Reject
            </Button>
            <Button
              variant="solid"
              size="1"
              onClick={() => {
                setSelectedAction("QUOTE_ACCEPTED");
                setIsDialogOpen(true);
              }}
            >
              Quote Accepted
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  // Fetch employee list
  useEffect(() => {
    const fetchEmployeeList = async () => {
      try {
        const data = await apiList.getEmployeByOrgId("714361434540086498");
        setEmployeeList(data.data);
      } catch (error) {
        console.error("Error fetching employee list:", error);
      }
    };
    fetchEmployeeList();
  }, []);

  return (
    <div className="background p-4">
      <div className="container mx-auto">
        <header>
          <Text weight="bold">My Enquiries</Text>
          <Flex gap="4" wrap="nowrap" className="pt-3 scroll-container">
            {statusFilterCards}
          </Flex>
          {/* Search and Date Picker */}
          <div className="mt-6">
            <Flex justify="between">
              <TextField.Root
                radius="full"
                size="3"
                placeholder="Search by Company Name ... "
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              >
                <TextField.Slot side="right" px="1">
                  <IconButton onClick={handleSearch}>
                    <Search width="18" height="18" />
                  </IconButton>
                </TextField.Slot>
              </TextField.Root>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <Button variant="soft">
                    Options
                    <DropdownMenu.TriggerIcon />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DateFilter />
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Flex>
            <div className="w-full sm:w-auto flex justify-end mt-3 sm:mt-0">
              <Button variant="outline" size="2">
                <Download height="16px" width="16px" /> Download
              </Button>
            </div>
          </div>
        </header>
        {/* Select All and Bulk Actions */}
        <Flex align="center" gap="3" className="mt-6">
          <Checkbox
            checked={
              selectedEnquiries.length === enquiries.length &&
              enquiries.length > 0
            }
            onCheckedChange={handleSelectAll}
          />
          <Text>Select All</Text>

          {selectedEnquiries.length > 0 && (
            <Flex align="start" gap="3">
              <Text>Selected {selectedEnquiries.length} Enquiries</Text>
              {renderBulkActions()}
            </Flex>
          )}
        </Flex>
        {/* Enquiry List */}
        <div className="space-y-4 mt-6">
          {enquiries.length === 0 ? (
            <div className="text-center">
              <Flex direction="column" gap="4" align="center">
                <img
                  src={NoResultFound}
                  alt="No result found"
                  height={85}
                  width={85}
                />
                <Text size="3" weight="bold">
                  Sorry! No results found
                </Text>
              </Flex>
            </div>
          ) : (
            enquiries &&
            enquiries.map((enquiry) => (
              <EnquiryCard
                key={enquiry.salesEnquiryId}
                enquiry={enquiry}
                selectedStatus={selectedStatus}
                isSelected={selectedEnquiries.includes(enquiry.salesEnquiryId)}
                onSelect={() => handleEnquirySelection(enquiry.salesEnquiryId)}
                onStatusChange={handleStatusChange}
                onClick={() =>
                  navigate(`/enquiries/detail/${enquiry.salesEnquiryId}`)
                }
              />
            ))
          )}
        </div>
        {/* Pagination */}
        {enquiries.length > 0 && (
          <div className="flex justify-end px-4">
            <ReactPaginate
              containerClassName={"pagination flex flex-wrap justify-end"}
              pageClassName={"page-item"}
              activeClassName={"active"}
              onPageChange={handlePageChange}
              pageCount={totalPages}
              forcePage={currentPage}
              breakLabel="..."
              previousLabel="Previous"
              nextLabel="Next"
              previousClassName={"page-item"}
              nextClassName={"page-item"}
            />
          </div>
        )}
        <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Dialog.Content>
            <Dialog.Title>
              {selectedAction === "REJECTED"
                ? "Reject Enquiries"
                : `Confirm ${selectedAction?.toLowerCase()}`}
            </Dialog.Title>
            <Dialog.Description>
              Are you sure you want to {selectedAction?.toLowerCase()} the
              selected enquiries?
            </Dialog.Description>

            {selectedAction === "ASSIGNED" && (
              <Box width="250px" className="mt-4">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Button variant="soft">
                      {selectedEmployee?.fullName || "Select Employee"}
                      <DropdownMenu.TriggerIcon />
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    {employeeList &&
                      employeeList.map((employee, index) => (
                        <DropdownMenu.Item
                          key={index}
                          onSelect={() =>
                            setSelectedEmployee(employeeList[index])
                          }
                        >
                          {employee.fullName}
                        </DropdownMenu.Item>
                      ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </Box>
            )}

            <TextField.Root
              mt="2"
              placeholder="Add a remark (optional)"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
            <Flex gap="3" justify="end" className="mt-4">
              <Button variant="soft" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="solid"
                onClick={async () => {
                  if (selectedAction === "ASSIGNED") {
                    if (!selectedEmployee) {
                      toast.error("Please select an employee");
                      return;
                    }

                    console.log(selectedEmployee);

                    await handleBulkStatusChange(
                      selectedEmployee,
                      selectedAction,
                      remark
                    );
                  }

                  if (selectedAction) {
                    if (selectedAction !== "ASSIGNED") {
                      await handleBulkStatusChange(
                        null,
                        selectedAction,
                        remark
                      );
                    } else {
                      await handleBulkStatusChange(
                        selectedEmployee,
                        selectedAction,
                        remark
                      );
                    }
                    setIsDialogOpen(false);
                    setRemark("");
                    setSelectedEmployee(null);
                  }
                }}
              >
                Confirm
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </div>
    </div>
  );
}

// EnquiryCard Component
const EnquiryCard = ({
  enquiry,
  isSelected,
  selectedStatus,
  onSelect,
  onStatusChange,
  onClick,
}: {
  enquiry: Enquiry;
  isSelected: boolean;
  selectedStatus: string;
  onSelect: () => void;
  onStatusChange: (id: string, status: string) => void;
  onClick: () => void;
}) => (
  <Card onClick={onClick} className="rounded-lg p-4 mb-4 relative">
    <Flex direction="column" gap="4">
      {/* Company Info Section */}
      <Flex justify="between" align="start" className="mb-2">
        <Box>
          <Flex align="center" gap="2" className="mb-2">
            <Checkbox
              checked={isSelected}
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            />
            <Text as="div" size="3" weight="bold">
              {enquiry.buyerDto.companyName}
            </Text>
          </Flex>
          <Flex gap="2">
            <Badge color="orange" radius="full">
              Status: {enquiry.enquiryStatus}
            </Badge>
            <Badge color="orange" radius="full">
              {timeAgo(enquiry.dateCreated)}
            </Badge>
            {enquiry.pocInfo && (
              <Badge color="orange" radius="full">
                Assignee: {enquiry.pocInfo.pocName}
              </Badge>
            )}
          </Flex>
          <Flex align="center" gap="2" className="text-sm mt-2 text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            <Text>{enquiry.buyerDto.state}</Text>
          </Flex>
        </Box>
      </Flex>
      {/* Details Section */}
      <Flex direction="row" gap="6">
        <DataList.Root orientation="vertical" size="3">
          <DataList.Item>
            <DataList.Label minWidth="88px">Exp Delivery Date</DataList.Label>
            <DataList.Value>
              {formatTimestamp(enquiry.expDeliveryDate)}
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
        <DataList.Root orientation="vertical" size="3">
          <DataList.Item>
            <DataList.Label minWidth="88px">Quantity</DataList.Label>
            <DataList.Value>
              <ul>
                {enquiry.lineItemDtoList &&
                  enquiry.lineItemDtoList.map((item) => (
                    <li key={item.id}>
                      {item.quantity} {item.unit}
                    </li>
                  ))}
              </ul>
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
        <DataList.Root orientation="vertical" size="3">
          <DataList.Item>
            <DataList.Label minWidth="88px">Product</DataList.Label>
            <DataList.Value>
              <ul>
                {enquiry.lineItemDtoList &&
                  enquiry.lineItemDtoList.map((item) => (
                    <li key={item.id}>{item.productName}</li>
                  ))}
              </ul>
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
      </Flex>

      {selectedStatus === "PENDING" && (
        <>
          <Separator my="1" size="4" className="hidden md:block" />
          <div className="w-full grid grid-cols-2 gap-4 px-4 md:absolute md:top-4 md:right-4 md:w-auto md:flex md:flex-row">
            <Button
              size="2"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(enquiry.salesEnquiryId, "REJECTED");
              }}
              variant="outline"
              className="w-full md:w-[120px]"
            >
              <X /> Reject
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange(enquiry.salesEnquiryId, "ACCEPTED");
              }}
              variant="solid"
              size="2"
              className="w-full md:w-[120px]"
            >
              <Check />
              Accept
            </Button>
          </div>
        </>
      )}
    </Flex>
  </Card>
);
