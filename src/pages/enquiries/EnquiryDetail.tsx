import { Box, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import apiList from "../../api/api";
import { Enquiry, Employee } from "../../types/enquiry";
import EnquiryHeader from "../../components/enquiryDetail/EnquiryHeader";
import EnquiryInfoCard from "../../components/enquiryDetail/EnquiryInfoCard";
import QuotationCard from "../../components/enquiryDetail/QuotationCard";
import OrderCard from "../../components/enquiryDetail/OrderCard";
import AssignTeamMemberCard from "../../components/enquiryDetail/AssignTeamMemberCard";
import StatusUpdateCard from "../../components/enquiryDetail/StatusUpdateCard";
import ContactDetailsCard from "@/components/enquiryDetail/ContactDetailCard";
import LocationCard from "@/components/enquiryDetail/LocationCard";

export default function EnquiryDetails() {
  const { salesEnquiryId } = useParams<{ salesEnquiryId: string }>();
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (salesEnquiryId) {
      fetchEnquiry(salesEnquiryId);
      fetchEmployeeList();
    }
  }, [salesEnquiryId]);

  const fetchEnquiry = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await apiList.getEnquiryById("714361434540086498", id);
      setEnquiry(data.data);
    } catch (error) {
      console.error("Error fetching enquiry:", error);
    } finally {
      setIsLoading(false);
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

  const handleAssignmentComplete = () => {
    if (salesEnquiryId) {
      fetchEnquiry(salesEnquiryId);
    }
  };

  // Check if the enquiry status is "ACCEPTED"
  const isEnquiryAccepted = () => {
    if (!enquiry) return false;
    return enquiry.enquiryStatus === "ACCEPTED";
  };

  if (isLoading) {
    return <Text className="p-4">Loading enquiry details...</Text>;
  }

  if (!enquiry) {
    return <Text className="p-4">Enquiry not found</Text>;
  }

  return (
    <div className="background">
      <Box className="max-w-7xl mx-auto p-3">
        <EnquiryHeader />
        <EnquiryInfoCard enquiry={enquiry} />

        {/* Conditional rendering for Quotation details */}
        {enquiry.buyerQuoteDto && (
          <QuotationCard quotation={enquiry.buyerQuoteDto} />
        )}

        {/* Conditional rendering for Order details */}
        {enquiry.salesOrderDto && <OrderCard order={enquiry.salesOrderDto} />}

        {/* Team member assignment component */}
        <AssignTeamMemberCard
          salesEnquiryId={salesEnquiryId || ""}
          employeeList={employeeList}
          onAssignmentComplete={handleAssignmentComplete}
          assignedTeamMember={enquiry.pocInfo}
          isEnquiryAccepted={isEnquiryAccepted()}
        />

        {/* Status update component */}
        <StatusUpdateCard statusHistory={enquiry.statusHistory || []} />

        {/* Contact details component */}
        <ContactDetailsCard
          minBuyerDto={enquiry.minBuyerDto}
          enquiryStatus={enquiry.enquiryStatus}
        />
        {/* Location information component */}
        <LocationCard
          shippingAddress={enquiry.shippingAddress}
          billingAddress={enquiry.billingAddress}
        />
      </Box>
    </div>
  );
}
