import {
  Box,
  Flex,
  Button,
  IconButton,
  Text,
  TextField,
  Checkbox,
  DropdownMenu,
  Dialog,
} from "@radix-ui/themes";
import { Check, Download, Search, UserPlus, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";
import apiList from "../../api/api";
import ReactPaginate from "react-paginate";
import NoResultFound from "@/assets/image/no-result-found.webp";
import DateFilter from "./DateFilter";
import EnquiryCard from "@/components/enquiries/EnquiryCard";
import StatusFilterCards from "@/components/enquiries/StatusFilterCards";
import EnquirySearchFilters from "../../components/enquiries/EnquirySearchFilters";

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

  // Render status filter cards
  const renderStatusFilterCards = () => (
    <StatusFilterCards
      statusList={statusList}
      selectedStatus={selectedStatus}
    />
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
    <div className="background">
      <div className="max-w-7xl mx-auto">
        <header>
          <div className="pt-3 flex flex-col">
            <StatusFilterCards
              statusList={statusList}
              selectedStatus={selectedStatus}
            />
            <EnquirySearchFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearch={handleSearch}
            />
          </div>
        </header>
        <section className="p-4">
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
                    height="85px"
                    width="85px"
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
                  isSelected={selectedEnquiries.includes(
                    enquiry.salesEnquiryId
                  )}
                  onSelect={() =>
                    handleEnquirySelection(enquiry.salesEnquiryId)
                  }
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
        </section>
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
