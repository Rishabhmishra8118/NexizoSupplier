"use client";
import {
  Badge,
  Card,
  Box,
  Flex,
  TabNav,
  Text,
  DropdownMenu,
  DataList,
  Code,
  IconButton,
  Dialog,
  TextField,
} from "@radix-ui/themes";
import { Button } from "@radix-ui/themes";
import { ArrowLeft, CopyIcon, Dot, Download, MapPin } from "lucide-react";
import { NavLink } from "react-router";
import { formatTimestamp, timeAgo } from "../../utils/Commons";
import { useEffect, useState } from "react";
import apiList from "../../api/api";
import { useParams } from "react-router";
import { toast } from "sonner";
export default function EnquiryDetails() {
  const { salesEnquiryId } = useParams<{ salesEnquiryId: string }>();
  const [enquiry, setEnquiry] = useState<any>(null);
  const [employeeList, setEmployeeList] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [remark, setRemark] = useState<string>("");

  const fetchEnquiry = async (id: string) => {
    try {
      const data = await apiList.getEnquiryById("714361434540086498", id);
      setEnquiry(data.data);
      console.log(data.data);
    } catch (error) {
      console.error("Error fetching enquiry:", error);
    }
  };

  const fetchEmployeeList = async () => {
    try {
      const data = await apiList.getEmployeByOrgId("714361434540086498");

      setEmployeeList(data.data);
    } catch (error) {
      console.error("Error fetching employee list:", error);
    }
  };

  const assignTeamMember = async () => {
    if (!selectedEmployee) {
      console.error("No employee selected");
      return;
    }

    try {
      const selectedEmployeeData = employeeList.find(
        (employee) => employee.fullName === selectedEmployee
      );

      if (!selectedEmployeeData) {
        console.error("Selected employee not found");
        return;
      }

      const data = await apiList.assignTeamMember(
        "714361434540086498",
        salesEnquiryId!,
        selectedEmployeeData.fullName,
        selectedEmployeeData.emails,
        selectedEmployeeData.mobileNumbers,
        selectedEmployeeData.employeeId
      );

      toast.success("Team member assigned successfully");
      fetchEnquiry(salesEnquiryId!);
      console.log("Team member assigned:", data);
    } catch (error) {
      console.error("Error assigning team member:", error);
    }
  };

  const handleStatusChange = async (status: string | null, remarks: string) => {
    if (!status) {
      toast.error("No status selected");
      return;
    }
    try {
      await apiList.updateEnquiryStatus(
        "714361434540086498",
        salesEnquiryId!,
        status,
        remarks
      );
      fetchEnquiry(salesEnquiryId!);
      setSelectedStatus(status);
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      console.error(`Error updating status to ${status}:`, error);
    }
  };
  useEffect(() => {
    console.log("salesEnquiryId", salesEnquiryId);
    if (salesEnquiryId) {
      fetchEnquiry(salesEnquiryId);
      fetchEmployeeList();
    }
  }, [salesEnquiryId]);

  if (!enquiry) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 background">
      <div className="container mx-auto">
        <Button variant="soft" className="mb-4">
          <ArrowLeft /> Back
        </Button>

        <TabNav.Root>
          <TabNav.Link href="#" active>
            Overview
          </TabNav.Link>
          <TabNav.Link href="#">Contacts</TabNav.Link>
          <TabNav.Link href="#">Location</TabNav.Link>

          <TabNav.Link href="#">Past Transactions</TabNav.Link>
        </TabNav.Root>

        {/* Overview */}
        <Card className=" rounded-lg p-4 mt-4">
          <Flex direction="column" gap="4">
            <Flex justify="between" align="start" className="mb-2">
              <Box>
                <Flex align="center" gap="2" className="mb-2">
                  <Text as="div" size="3" weight="bold">
                    {enquiry.minBuyerDto.companyName}
                  </Text>
                  <Badge color="orange" radius="full">
                    Status: {enquiry.enquiryStatus}
                  </Badge>
                  <Badge color="orange" radius="full">
                    {timeAgo(enquiry.dateCreated)}
                  </Badge>
                </Flex>

                <Flex
                  align="center"
                  gap="2"
                  className="text-sm mt-2 text-gray-600"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  <Text>{enquiry.buyerBillingAddressDto.city}</Text>
                </Flex>
              </Box>
            </Flex>
            <Flex direction="row" gap="6">
              <DataList.Root orientation="vertical" size="3">
                <DataList.Item>
                  <DataList.Label minWidth="88px">
                    Exp Delivery Date
                  </DataList.Label>
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
                      {enquiry.lineItemDtoList.map((item) => (
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
                      {enquiry.lineItemDtoList.map((item) => (
                        <li key={item.id}>{item.productName}</li>
                      ))}
                    </ul>
                  </DataList.Value>
                </DataList.Item>
              </DataList.Root>
            </Flex>
            <Card>
              <Flex justify="between" align="center">
                <Text>Attachments file</Text>
                <Download />
              </Flex>
            </Card>
          </Flex>
        </Card>

        {/* contacts */}

        <Card className="mt-4 p-4 shadow-lg rounded-lg">
          <Text weight="bold" className="mb-4">
            Assign Team Member
          </Text>

          {enquiry.pocInfo && (
            <Flex gap="2" className="mt-2">
              <Text weight="medium">Assign to :</Text>
              <Text>{enquiry.pocInfo.pocName}</Text>
            </Flex>
          )}
          <Box width="250px" className="mt-4">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="soft">
                  {selectedEmployee || "Select Employee"}
                  <DropdownMenu.TriggerIcon />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                {employeeList &&
                  employeeList.map((employee: any, index: number) => (
                    <DropdownMenu.Item
                      key={index}
                      onSelect={() => setSelectedEmployee(employee.fullName)}
                    >
                      {employee.fullName}
                    </DropdownMenu.Item>
                  ))}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Box>
          <Box className="mt-4" width="250px">
            <Button
              disabled={
                enquiry.enquiryStatus === "PENDING" ||
                enquiry.enquiryStatus === "REJECTED"
              }
              variant="solid"
              onClick={assignTeamMember}
            >
              Assign Now
            </Button>
          </Box>
        </Card>

        {/* status update */}

        <Card className="mt-4 p-4 shadow-lg rounded-lg">
          <Text weight="bold" className="mb-4">
            Status Update
          </Text>
          {enquiry.statusHistory.map((status: any, index: number) => (
            <Flex key={index} className="mt-2 mb-5 gap-3 items-start">
              <Dot width="24px" height="24px" className="text-orange-500" />
              <Box className="flex-1">
                <Flex gap="2" className="p-1 items-center">
                  <Text
                    as="div"
                    size="2"
                    weight="medium"
                    className="text-gray-600"
                  >
                    {formatTimestamp(status.dateCreated)}
                  </Text>
                  <Badge color="orange" radius="full">
                    {status.status}
                  </Badge>
                </Flex>
                <Text
                  as="div"
                  size="2"
                  weight="bold"
                  className="text-gray-800 mt-1"
                >
                  {status.remarks}
                </Text>
              </Box>
            </Flex>
          ))}

          <Dialog.Root>
            <Dialog.Trigger>
              <Button
                disabled={
                  !enquiry.pocInfo ||
                  enquiry.enquiryStatus === "PENDING" ||
                  enquiry.enquiryStatus === "REJECTED"
                }
              >
                Update Status
              </Button>
            </Dialog.Trigger>

            <Dialog.Content maxWidth="450px">
              <Dialog.Title>Update Status</Dialog.Title>
              <Dialog.Description size="2" mb="4">
                Please add status and remarks
              </Dialog.Description>

              <Flex gap="3">
                <Button
                  variant={selectedStatus === "FOLLOW_UP" ? "solid" : "soft"}
                  color="gray"
                  onClick={() => setSelectedStatus("FOLLOW_UP")}
                >
                  Follow Up
                </Button>
                <Button
                  variant={selectedStatus === "COMPLETED" ? "solid" : "soft"}
                  color="gray"
                  onClick={() => setSelectedStatus("COMPLETED")}
                >
                  Completed
                </Button>
                <Button
                  variant={selectedStatus === "REJECTED" ? "solid" : "soft"}
                  color="gray"
                  onClick={() => setSelectedStatus("REJECTED")}
                >
                  Rejected
                </Button>
              </Flex>

              <Flex className="mt-4" direction="column" gap="3">
                <label>
                  <Text as="div" size="2" mb="1" weight="bold">
                    Remark
                  </Text>
                  <TextField.Root
                    placeholder="Enter remarks"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                  />
                </label>
              </Flex>

              <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                  <Button variant="soft" color="gray">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Dialog.Close>
                  <Button
                    onClick={() => handleStatusChange(selectedStatus, remark)}
                  >
                    Save
                  </Button>
                </Dialog.Close>
              </Flex>
            </Dialog.Content>
          </Dialog.Root>
        </Card>

        {/* contact details  */}
        <Card className="mt-4">
          <Text weight="bold">Contact Details</Text>
          <DataList.Root className="mt-2">
            <DataList.Item>
              <DataList.Label minWidth="88px">
                Contact Person Name
              </DataList.Label>
              <DataList.Value>
                {enquiry.minBuyerDto.accountingName}
              </DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label minWidth="88px">Company GST</DataList.Label>
              <DataList.Value>
                <Flex align="center" gap="2">
                  <Code variant="ghost">
                    {enquiry.minBuyerDto.registrationNumber}
                  </Code>
                  <IconButton
                    size="1"
                    aria-label="Copy value"
                    color="gray"
                    variant="ghost"
                  >
                    <CopyIcon />
                  </IconButton>
                </Flex>
              </DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label minWidth="88px">Contact Email</DataList.Label>
              <DataList.Value>
                <NavLink to="mailto:vlad@workos.com">
                  {enquiry.minBuyerDto.emailAddresses[0]}
                </NavLink>
              </DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label minWidth="88px">
                Contact Phone Number
              </DataList.Label>
              <DataList.Value>
                {enquiry.minBuyerDto.mobileNumbers[0]}
              </DataList.Value>
            </DataList.Item>
            <DataList.Item>
              <DataList.Label minWidth="88px">Company</DataList.Label>
              <DataList.Value>{enquiry.minBuyerDto.companyName}</DataList.Value>
            </DataList.Item>
          </DataList.Root>
        </Card>

        {/* location */}
        <Card className="mt-4">
          <Text weight="bold">Location</Text>
          <DataList.Root className="mt-2">
            <DataList.Item>
              <DataList.Label minWidth="88px">Site Location</DataList.Label>
              <DataList.Value>-</DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label minWidth="88px">Company Location</DataList.Label>
              <DataList.Value>
                {" "}
                {enquiry.buyerBillingAddressDto.addressLine1}{" "}
                {enquiry.buyerBillingAddressDto.addressLine2}{" "}
                {enquiry.buyerBillingAddressDto.city}{" "}
                {enquiry.buyerBillingAddressDto.state}{" "}
                {enquiry.buyerBillingAddressDto.pinCode}
              </DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label minWidth="88px">Projects</DataList.Label>
              <DataList.Value>-</DataList.Value>
            </DataList.Item>
          </DataList.Root>
        </Card>

        {/* last transaction */}

        <Card className="mt-4">
          <Text weight="bold"> Last Transactions</Text>
          <Card className="mt-2">
            <DataList.Root orientation="vertical" className="mt-2">
              <DataList.Item>
                <DataList.Label minWidth="88px">Site Location</DataList.Label>
                <DataList.Value>Vlad Moroz</DataList.Value>
              </DataList.Item>

              <DataList.Item>
                <DataList.Label minWidth="88px">
                  Company Location
                </DataList.Label>
                <DataList.Value>Ayodhya</DataList.Value>
              </DataList.Item>

              <DataList.Item>
                <DataList.Label minWidth="88px">Projects</DataList.Label>
                <DataList.Value>Building Dam</DataList.Value>
              </DataList.Item>
            </DataList.Root>
          </Card>
        </Card>
      </div>
    </div>
  );
}
