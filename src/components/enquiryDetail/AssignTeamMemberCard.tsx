import {
  Box,
  Button,
  Card,
  Dialog,
  DropdownMenu,
  Flex,
  Text,
  Avatar,
} from "@radix-ui/themes";
import { toast } from "sonner";
import { useState } from "react";
import { Employee } from "../../types/enquiry";
import apiList from "../../api/api";
import { UserPlus, UserCheck, AlertCircle } from "lucide-react";

interface AssignTeamMemberCardProps {
  salesEnquiryId: string;
  employeeList: Employee[];
  onAssignmentComplete: () => void;
  assignedTeamMember?: {
    pocName: string;
  };
  isEnquiryAccepted: boolean;
}

const AssignTeamMemberCard = ({
  salesEnquiryId,
  employeeList,
  onAssignmentComplete,
  assignedTeamMember,
  isEnquiryAccepted,
}: AssignTeamMemberCardProps) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // Get full employee details if a team member is assigned
  const getAssignedEmployeeDetails = () => {
    if (!assignedTeamMember) return null;

    return employeeList.find(
      (emp) => emp.fullName === assignedTeamMember.pocName
    );
  };

  const assignedEmployee = getAssignedEmployeeDetails();
  console.log(assignedEmployee);

  const handleAssignClick = () => {
    if (!selectedEmployee) {
      toast.error("No employee selected");
      return;
    }

    setIsConfirmationOpen(true);
  };

  const assignTeamMember = async () => {
    if (!selectedEmployee) {
      toast.error("No employee selected");
      return;
    }

    const selectedEmployeeData = employeeList.find(
      (employee) => employee.fullName === selectedEmployee
    );

    if (!selectedEmployeeData) {
      toast.error("Selected employee not found");
      return;
    }

    try {
      await apiList.assignTeamMember(
        "714361434540086498",
        salesEnquiryId,
        selectedEmployeeData.fullName,
        selectedEmployeeData.emails,
        selectedEmployeeData.mobileNumbers,
        selectedEmployeeData.employeeId
      );
      toast.success("Team member assigned successfully");
      onAssignmentComplete();
      setSelectedEmployee(null);
      setIsConfirmationOpen(false);
    } catch (error) {
      console.error("Error assigning team member:", error);
      toast.error("Failed to assign team member");
    }
  };

  return (
    <Card className="mt-4 p-4">
      <Flex justify="between" align="center" mb="3">
        <Flex align="center" gap="2">
          {assignedTeamMember ? (
            <UserCheck size={18} className="text-green-600" />
          ) : (
            <UserPlus size={18} className="text-blue-600" />
          )}
          <Text size="2" weight="bold">
            {assignedTeamMember ? "Assigned Team Member" : "Assign Team Member"}
          </Text>
        </Flex>
      </Flex>

      {assignedTeamMember ? (
        // Display assigned team member details
        <Card className="mt-2  p-3 bg-gray-50">
          <Flex gap="3" align="center">
            <Avatar
              size="3"
              radius="full"
              fallback={assignedTeamMember.pocName.charAt(0).toUpperCase()}
              color="indigo"
            />
            <Box>
              <Text weight="bold" size="2">
                {assignedTeamMember.pocName}
              </Text>
            </Box>
          </Flex>

          {isEnquiryAccepted && (
            <Flex mt="3" justify="end">
              <Button
                size="1"
                variant="soft"
                onClick={() => setIsConfirmationOpen(true)}
              >
                Reassign
              </Button>
            </Flex>
          )}
        </Card>
      ) : // Show assignment UI only if the enquiry is accepted
      isEnquiryAccepted ? (
        <Flex direction="column" gap="3" className="mt-3">
          <Text size="2" color="gray">
            Select a team member to handle this enquiry
          </Text>
          <Flex
            direction={{ initial: "column", sm: "row" }}
            gap="3"
            align={{ sm: "end" }}
          >
            <Box style={{ flexGrow: 1, minWidth: "200px", maxWidth: "500px" }}>
              <Text as="div" size="2" mb="1" weight="medium">
                Team Member
              </Text>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger style={{ width: "100%" }}>
                  <Button
                    size="2"
                    variant="soft"
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    {selectedEmployee || "Select Employee"}
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  {employeeList.length > 0 ? (
                    employeeList.map((employee, index) => (
                      <DropdownMenu.Item
                        key={index}
                        onSelect={() => setSelectedEmployee(employee.fullName)}
                      >
                        {employee.fullName}
                      </DropdownMenu.Item>
                    ))
                  ) : (
                    <DropdownMenu.Item disabled>
                      No employees found
                    </DropdownMenu.Item>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Box>
            <Button variant="solid" onClick={handleAssignClick}>
              Assign Now
            </Button>
          </Flex>
        </Flex>
      ) : (
        <Flex align="center" gap="2" className="mt-3 p-3 bg-amber-50 rounded">
          <AlertCircle size={16} className="text-amber-500" />
          <Text size="2" color="amber">
            Enquiry must be accepted before a team member can be assigned.
          </Text>
        </Flex>
      )}

      {/* Confirmation Dialog */}
      <Dialog.Root
        open={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
      >
        <Dialog.Content>
          <Dialog.Title>Confirm Assignment</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            {assignedTeamMember
              ? `Are you sure you want to reassign this enquiry? Current assignee: ${assignedTeamMember.pocName}`
              : `Are you sure you want to assign this enquiry to ${selectedEmployee}?`}
          </Dialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>
            <Button onClick={assignTeamMember}>
              {assignedTeamMember ? "Reassign" : "Confirm"}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Card>
  );
};

export default AssignTeamMemberCard;
