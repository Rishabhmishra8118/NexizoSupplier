import {
  Card,
  Flex,
  Box,
  Text,
  Checkbox,
  Badge,
  Button,
  Separator,
  DataList,
} from "@radix-ui/themes";
import { X, UserPlus, Check } from "lucide-react";
import { formatTimestamp, timeAgo } from "../../utils/Commons";

interface LineItem {
  id: string;
  quantity: number;
  uom: string;
  productName: string;
}

interface PocInfo {
  pocName: string;
  emailAddresses: string[];
  mobileNumbers: string[];
  pocId: string;
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
  statusDisplayValue: string;
  lineItemDtoList: LineItem[];
  pocInfo?: PocInfo;
}

interface EnquiryCardProps {
  enquiry: Enquiry;
  isSelected: boolean;
  selectedStatus: string;
  onSelect: () => void;
  onStatusChange: (id: string, status: string) => void;
  onClick: () => void;
}

const EnquiryCard: React.FC<EnquiryCardProps> = ({
  enquiry,
  isSelected,
  selectedStatus,
  onSelect,
  onStatusChange,
  onClick,
}) => (
  <Card
    onClick={onClick}
    className="rounded-lg p-4 mb-4 relative hover:shadow-md transition-shadow"
    role="article"
    aria-label={`Enquiry from ${enquiry.buyerDto.companyName}`}
  >
    <Flex direction="column" gap="4">
      <Flex justify="between" align="start" className="mb-2">
        <Box>
          <Flex align="center" gap="2" className="mb-2">
            <Checkbox
              checked={isSelected}
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              aria-label={`Select enquiry from ${enquiry.buyerDto.companyName}`}
            />
            <Text as="div" size="3" weight="bold">
              {enquiry.buyerDto.companyName}
            </Text>
          </Flex>
          <Flex gap="2" wrap="wrap">
            <Badge color="orange" radius="full">
              {timeAgo(enquiry.dateCreated)}
            </Badge>
            <Badge color="orange" radius="full">
              {enquiry.statusDisplayValue}
            </Badge>
            {enquiry.pocInfo && (
              <Badge color="orange" radius="full">
                Assignee: {enquiry.pocInfo.pocName}
              </Badge>
            )}
          </Flex>
          <Flex align="center" gap="2" className="text-sm mt-2 text-gray-600">
            <Text>{enquiry.buyerDto.state}</Text>
          </Flex>
        </Box>
      </Flex>
      <Flex direction="row" gap="6" className="flex-wrap">
        <DataList.Root orientation="vertical" size="2">
          <DataList.Item>
            <DataList.Label minWidth="88px">Exp Delivery Date</DataList.Label>
            <DataList.Value>
              {formatTimestamp(enquiry.expDeliveryDate)}
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
        <DataList.Root orientation="vertical" size="2">
          <DataList.Item>
            <DataList.Label minWidth="88px">Quantity</DataList.Label>
            <DataList.Value>
              <ul className="list-none m-0 p-0">
                {enquiry.lineItemDtoList.map((item) => (
                  <li key={item.id}>{item.quantity}</li>
                ))}
              </ul>
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
        <DataList.Root orientation="vertical" size="2">
          <DataList.Item>
            <DataList.Label minWidth="88px">Product</DataList.Label>
            <DataList.Value>
              <ul className="list-none m-0 p-0">
                {enquiry.lineItemDtoList.map((item) => (
                  <li key={item.id}>
                    <Text size="2">{item.productName}</Text>
                  </li>
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
              aria-label="Reject enquiry"
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
              aria-label="Accept enquiry"
            >
              <Check /> Accept
            </Button>
          </div>
        </>
      )}
    </Flex>
  </Card>
);

export default EnquiryCard;
