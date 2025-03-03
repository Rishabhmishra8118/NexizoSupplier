import { Box, Card, Flex, Text } from "@radix-ui/themes";
import { Mail, Phone, User, FileText, Lock } from "lucide-react";

interface ContactDetailsProps {
  minBuyerDto: {
    pocName?: string;
    emailAddresses?: string[];
    mobileNumbers?: string[];
    registrationNumber?: string | null;
  };
  enquiryStatus: string; // Added enquiry status prop
}

const ContactDetailsCard = ({
  minBuyerDto,
  enquiryStatus,
}: ContactDetailsProps) => {
  const {
    pocName,
    emailAddresses = [],
    mobileNumbers = [],
    registrationNumber,
  } = minBuyerDto;

  // Check if contact details should be hidden
  const shouldHideDetails =
    enquiryStatus === "PENDING" || enquiryStatus === "REJECTED";

  return (
    <Card className="mt-4 p-4">
      <Flex align="center" gap="2" mb="4">
        <Text size="2" weight="bold">
          Contact Details
        </Text>

        {shouldHideDetails && (
          <Flex align="center" gap="1" ml="auto">
            <Lock size={14} className="text-amber-500" />
            <Text size="1" color="amber">
              {enquiryStatus === "PENDING"
                ? "Accept to view details"
                : "Access restricted"}
            </Text>
          </Flex>
        )}
      </Flex>

      {shouldHideDetails ? (
        <Box className="p-8 flex flex-col items-center text-center justify-center">
          <Lock size={28} className="text-gray-400 mx-auto mb-2" />
          <Text align="center" size="2" color="gray" className="max-w-md">
            {enquiryStatus === "PENDING"
              ? "Contact information will be available after you accept this enquiry."
              : "Contact information is not available for rejected enquiries."}
          </Text>
        </Box>
      ) : (
        <Box className="p-2">
          <Flex direction="column" gap="3">
            {pocName && (
              <Flex gap="3" align="start">
                <Flex gap="2" align="center" style={{ minWidth: "160px" }}>
                  <User size={16} className="text-gray-500" />
                  <Text size="2" color="gray">
                    Contact Person:
                  </Text>
                </Flex>
                <Text size="2" weight="medium">
                  {pocName}
                </Text>
              </Flex>
            )}

            {registrationNumber && (
              <Flex gap="3" align="start">
                <Flex gap="2" align="center" style={{ minWidth: "160px" }}>
                  <FileText size={16} className="text-gray-500" />
                  <Text size="2" color="gray">
                    Company GST:
                  </Text>
                </Flex>
                <Text size="2" weight="medium">
                  {registrationNumber}
                </Text>
              </Flex>
            )}

            <Flex gap="3" align="start">
              <Flex gap="2" align="center" style={{ minWidth: "160px" }}>
                <Phone size={16} className="text-gray-500" />
                <Text size="2" color="gray">
                  Contact {mobileNumbers.length > 1 ? "Phone Numbers" : "Phone"}
                  :
                </Text>
              </Flex>

              <Flex direction="column" gap="1">
                {mobileNumbers.length > 0 ? (
                  mobileNumbers.map((phone, index) => (
                    <Text size="2" weight="medium" key={index}>
                      {phone}
                    </Text>
                  ))
                ) : (
                  <Text size="2" weight="medium">
                    N/A
                  </Text>
                )}
              </Flex>
            </Flex>

            <Flex gap="3" align="start">
              <Flex gap="2" align="center" style={{ minWidth: "160px" }}>
                <Mail size={16} className="text-gray-500" />
                <Text size="2" color="gray">
                  Contact {emailAddresses.length > 1 ? "Emails" : "Email"}:
                </Text>
              </Flex>

              <Flex direction="column" gap="1">
                {emailAddresses.length > 0 ? (
                  emailAddresses.map((email, index) => (
                    <Text size="2" weight="medium" key={index}>
                      {email}
                    </Text>
                  ))
                ) : (
                  <Text size="2" weight="medium">
                    N/A
                  </Text>
                )}
              </Flex>
            </Flex>
          </Flex>
        </Box>
      )}
    </Card>
  );
};

export default ContactDetailsCard;
