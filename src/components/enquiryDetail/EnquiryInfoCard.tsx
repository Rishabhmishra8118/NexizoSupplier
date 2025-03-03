import {
  Box,
  Badge,
  Card,
  DataList,
  Flex,
  Text,
  Separator,
  Button,
} from "@radix-ui/themes";
import { Check, MapPin, X } from "lucide-react";
import { formatTimestamp, timeAgo } from "../../utils/Commons";
import { Enquiry } from "../../types/enquiry";

interface EnquiryInfoCardProps {
  enquiry: Enquiry;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

const EnquiryInfoCard = ({
  enquiry,
  onAccept,
  onReject,
}: EnquiryInfoCardProps) => {
  // Get the first line item (since there's always a single item)
  const lineItem = enquiry.lineItemDtoList?.[0];

  return (
    <Card className="rounded-lg p-3 sm:p-4 mt-4">
      <Flex align="center" gap="2" wrap="wrap" className="text-sm mt-2">
        <Text size="2" weight="bold" className="mb-3">
          Enquiry Details
        </Text>
        <Badge size="1" color="orange" radius="full">
          {enquiry.statusDisplayValue}
        </Badge>
        <Badge color="orange" radius="full">
          Last Update: {timeAgo(enquiry.dateCreated)}
        </Badge>
      </Flex>

      <Flex direction="column" gap="1">
        <Box className="mb-3">
          <Text
            as="div"
            weight="bold"
            size="3"
            className="mb-2 pt-4 font-black"
            style={{
              color: "#6600FF",
            }}
          >
            {enquiry.minBuyerDto?.companyName || "Unknown Company"}
          </Text>

          {enquiry.billingAddress?.state && (
            <Flex align="center" gap="2" className="text-sm mt-2 text-gray-600">
              <MapPin className="w-3 h-4 mr-1" />
              <Text size="1">{enquiry.billingAddress.state}</Text>
            </Flex>
          )}
        </Box>

        <Flex direction="row" gap="4" wrap="wrap" className="mt-1">
          <DataList.Root
            orientation="vertical"
            size="1"
            className="min-w-[140px]"
          >
            <DataList.Item>
              <DataList.Label minWidth="90px">Delivery Date</DataList.Label>
              <DataList.Value>
                {formatTimestamp(enquiry.expDeliveryDate)}
              </DataList.Value>
            </DataList.Item>
          </DataList.Root>

          <DataList.Root
            orientation="vertical"
            size="1"
            className="min-w-[120px]"
          >
            <DataList.Item>
              <DataList.Label minWidth="60px">Quantity</DataList.Label>
              <DataList.Value>
                <Text size="1">
                  {lineItem?.quantity} {lineItem?.uom}
                </Text>
              </DataList.Value>
            </DataList.Item>
          </DataList.Root>

          <DataList.Root
            orientation="vertical"
            size="1"
            className="flex-grow min-w-[120px]"
          >
            <DataList.Item>
              <DataList.Label minWidth="60px">Product</DataList.Label>
              <DataList.Value>
                <Text size="1">{lineItem?.productName}</Text>
              </DataList.Value>
            </DataList.Item>
          </DataList.Root>

          {lineItem?.brand && (
            <DataList.Root
              orientation="vertical"
              size="1"
              className="min-w-[120px]"
            >
              <DataList.Item>
                <DataList.Label minWidth="60px">Brand</DataList.Label>
                <DataList.Value>
                  <Text size="1">{lineItem.brand}</Text>
                </DataList.Value>
              </DataList.Item>
            </DataList.Root>
          )}
        </Flex>

        {enquiry.buyerNotes && (
          <DataList.Root
            orientation="vertical"
            size="1"
            className="min-w-[120px] mt-3"
          >
            <DataList.Item>
              <DataList.Label minWidth="60px">Remarks</DataList.Label>
              <DataList.Value>
                <Text size="1">{enquiry.buyerNotes}</Text>
              </DataList.Value>
            </DataList.Item>
          </DataList.Root>
        )}
      </Flex>

      {enquiry.enquiryStatus === "PENDING" && (
        <>
          <div className="w-full grid grid-cols-2 gap-4 mt-4 md:mt-0 px-4 md:absolute md:top-4 md:right-4 md:w-auto md:flex md:flex-row">
            <Button
              size="2"
              onClick={(e) => {
                e.stopPropagation();
                onReject(enquiry.salesEnquiryId);
              }}
              variant="outline"
              className="w-full md:w-[120px]"
              aria-label="Reject enquiry"
            >
              <X /> Reject
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onAccept(enquiry.salesEnquiryId);
              }}
              variant="solid"
              size="2"
              className="w-full md:w-[120px]"
              aria-label="Accept enquiry"
            >
              <Check /> Accept
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default EnquiryInfoCard;
