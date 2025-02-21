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
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    "REJECTED" | "ACCEPTED" | "ASSIGNED" | "QUOTED" | "QUOTE_ACCEPTED" | null
  >(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [remark, setRemark] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const REJECTION_REASONS = [
    "Low Turnover",
    "Price Mismatch",
    "Not Serviceable",
    "No Requirement",
    "Material Not Available",
    "Irrelevant Industry",
    "Not Responding",
    "Payment terms mismatched",
  ];

  const handleDownloadEnquiries = async (enquiryIds: string[]) => {
    if (!enquiryIds.length) return;

    try {
      setIsDownloading(true);

      const organizationId = "714361434540086498";
      const partnerId = employeeList[0].employeeId;

      if (!organizationId || !partnerId) {
        throw new Error("Missing required parameters");
      }

      const data = await apiList.downloadEnquiryReport(
        organizationId,
        partnerId,
        enquiryIds
      );

      if (!data.success || !data.data) {
        throw new Error(data.errorMessage || "Failed to get download URL");
      }

      // Create a hidden anchor and trigger download
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = data.data; // Use the S3 pre-signed URL
      a.download = "NEXIZO_REPORT.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success("Download started");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to download enquiries"
      );
    } finally {
      setIsDownloading(false);
    }
  };

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
        filter: searchParams.getAll("filter"),
        pageNumber:
          searchParams.get("pageNumber") || DEFAULT_PAGE_NUMBER.toString(),
        pageSize: searchParams.get("pageSize") || DEFAULT_PAGE_SIZE.toString(),
      };

      const queryString = new URLSearchParams();
      queryString.set("query", params.query);
      params.filter.forEach((filter: string) =>
        queryString.append("filter", filter)
      );
      queryString.set("pageNumber", params.pageNumber);
      queryString.set("pageSize", params.pageSize);

      const data = await apiList.getEnquiries(
        "714361434540086498",
        queryString
      );
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

  // Parse date filter from URL
  const parseDateFilter = useCallback(() => {
    const filters = searchParams.getAll("filter");
    const dateFilter = filters.find((f) => f.startsWith("DATE_CREATED:"));

    if (dateFilter) {
      const [, range] = dateFilter.split(":");
      const [startTimestamp, endTimestamp] = range.split("|");

      if (startTimestamp && endTimestamp) {
        const startDate = new Date(parseInt(startTimestamp));
        const endDate = new Date(parseInt(endTimestamp));
        setStartDate(startDate);
        setEndDate(endDate);
      }
    }
  }, [searchParams]);

  // Sync dates from URL when params change
  useEffect(() => {
    parseDateFilter();
  }, [parseDateFilter]);

  // Handle date range change
  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);

    // Get all existing params
    const newSearchParams = new URLSearchParams(searchParams);

    // Remove any existing date filter
    const existingFilters = newSearchParams.getAll("filter");
    newSearchParams.delete("filter");

    // Add back all non-date filters
    existingFilters
      .filter((f) => !f.startsWith("DATE_CREATED:"))
      .forEach((f) => newSearchParams.append("filter", f));

    if (start && end) {
      // Set start time to beginning of day (00:00:00)
      const startTime = new Date(start);
      startTime.setHours(0, 0, 0, 0);

      // Set end time to end of day (23:59:59)
      const endTime = new Date(end);
      endTime.setHours(23, 59, 59, 999);

      // Append the date filter as a new filter parameter
      const dateFilter = `DATE_CREATED:${startTime.getTime()}|${endTime.getTime()}`;
      newSearchParams.append("filter", dateFilter);
    }

    setSearchParams(newSearchParams);

    // Trigger enquiries fetch
    fetchEnquiriesData();
  };

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

    const filters = newParams.getAll("filter");
    const statusFilter = filters.find((filter) =>
      filter.startsWith("SALES_ENQUIRY_STATUS:")
    );

    if (statusFilter) {
      const status = statusFilter.split(":")[1];
      const query = newParams.get("query") || "";
      setSelectedStatus(status || "");
      setSearchQuery(query);
      console.log(newParams.toString());
      fetchEnquiriesData();
      fetchStatusCounts();
    }
  }, [searchParams, setSearchParams, fetchEnquiriesData, fetchStatusCounts]);

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
              onDateRangeChange={handleDateRangeChange}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </header>
        <section className="p-4">
          {/* Select All and Bulk Actions */}
          <Flex align="center" justify="between" className="mt-6">
            <Flex align="center" gap="3">
              <Checkbox
                checked={
                  selectedEnquiries.length === enquiries.length &&
                  enquiries.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <Text>Select All</Text>

              {selectedEnquiries.length > 0 && (
                <Flex align="center" gap="3">
                  <Text>Selected {selectedEnquiries.length} Enquiries</Text>
                  {renderBulkActions()}
                </Flex>
              )}
            </Flex>

            {selectedEnquiries.length > 0 && (
              <Button
                variant="outline"
                className="gap-2 bg-white hover:bg-gray-50"
                onClick={() => handleDownloadEnquiries(selectedEnquiries)}
                disabled={isDownloading}
              >
                <Download className="w-4 h-4" />
                {isDownloading ? "Downloading..." : "Download"}
              </Button>
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

            {selectedAction === "REJECTED" ? (
              <Box width="100%" className="mt-4">
                <Text as="label" size="2" my="4" weight="bold">
                  Select Reason *
                </Text>
                <div className="mt-2">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <Button variant="soft" className="w-full justify-between">
                        {rejectionReason || "Select a reason"}
                        <DropdownMenu.TriggerIcon />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      {REJECTION_REASONS.map((reason) => (
                        <DropdownMenu.Item
                          key={reason}
                          onSelect={() => setRejectionReason(reason)}
                        >
                          {reason}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
              </Box>
            ) : (
              <TextField.Root
                mt="4"
                placeholder="Add a remark (optional)"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            )}
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
                    if (selectedAction === "REJECTED" && !rejectionReason) {
                      toast.error("Please select a rejection reason");
                      return;
                    }

                    if (selectedAction !== "ASSIGNED") {
                      await handleBulkStatusChange(
                        null,
                        selectedAction,
                        selectedAction === "REJECTED" ? rejectionReason : remark
                      );
                    } else {
                      await handleBulkStatusChange(
                        selectedEmployee,
                        selectedAction,
                        remark
                      );
                    }
                    setIsDialogOpen(false);
                    setRejectionReason("");
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
