import {
  Badge,
  Box,
  Card,
  Flex,
  ScrollArea,
  Separator,
  Text,
} from "@radix-ui/themes";
import { CalendarIcon, FileText, IndianRupee, Truck } from "lucide-react";
import { formatTimestamp } from "../../utils/Commons";

interface QuotationCardProps {
  quotation: {
    totalPrice: number;
    gstPrice: number;
    totalItemPrice: number;
    quoteStatus: string;
    quoteApprovalStatus: string;
    expDeliveryDate: number;
    lineItemDtoList: Array<{
      lineItemId: string;
      productName: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      totalPrice: number;
      itemPrice: number;
      gstPercentage: number;
    }>;
    paymentTermDto: {
      advance: number;
      credit: number | null;
      displayName: string;
    };
  };
}

const QuotationCard = ({ quotation }: QuotationCardProps) => {
  return (
    <Card className="rounded-lg p-4 mt-4">
      <Flex justify="between" align="center" className="mb-4">
        <Text size="2" weight="bold">
          Quotation Details
        </Text>
        <Flex gap="2">
          <Badge color="blue" radius="full">
            {quotation.quoteStatus}
          </Badge>
          <Badge color="amber" radius="full">
            {quotation.quoteApprovalStatus.replace(/_/g, " ")}
          </Badge>
        </Flex>
      </Flex>

      <Flex wrap="wrap" gap="4">
        {/* Price Information */}
        <Card className="p-3 grow" style={{ minWidth: "200px" }}>
          <Flex align="center" gap="2" mb="2">
            <IndianRupee size={18} />
            <Text size="2" weight="bold">
              Price Details
            </Text>
          </Flex>
          <Flex direction="column" gap="1">
            <Flex justify="between">
              <Text size="1" color="gray">
                Item Total:
              </Text>
              <Text size="1">₹{quotation.totalItemPrice}</Text>
            </Flex>
            <Flex justify="between">
              <Text size="1" color="gray">
                GST:
              </Text>
              <Text size="1">₹{quotation.gstPrice}</Text>
            </Flex>
            <Separator my="1" size="4" />
            <Flex justify="between">
              <Text size="1" weight="bold">
                Total:
              </Text>
              <Text size="1" weight="bold">
                ₹{quotation.totalPrice}
              </Text>
            </Flex>
          </Flex>
        </Card>

        {/* Delivery & Payment */}
        <Card className="p-3 grow" style={{ minWidth: "200px" }}>
          <Flex align="center" gap="2" mb="2">
            <Truck size={18} />
            <Text size="2" weight="bold">
              Delivery & Payment
            </Text>
          </Flex>
          <Flex direction="column" gap="1">
            <Flex align="center" gap="1">
              <CalendarIcon size={14} />
              <Text size="1" color="gray">
                Expected Delivery:
              </Text>
              <Text size="1">{formatTimestamp(quotation.expDeliveryDate)}</Text>
            </Flex>
            <Flex align="center" gap="1">
              <FileText size={14} />
              <Text size="1" color="gray">
                Payment Terms:
              </Text>
              <Text size="1">{quotation.paymentTermDto.displayName}</Text>
            </Flex>
          </Flex>
        </Card>
      </Flex>

      {/* Products Table */}
      <Box className="mt-4">
        <Text size="2" weight="medium" mb="2">
          Products
        </Text>
        <ScrollArea scrollbars="horizontal" style={{ maxWidth: "100%" }}>
          <table
            className="w-full min-w-full"
            style={{ borderCollapse: "collapse", fontSize: "12px" }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid #eaeaea" }}>
                <th className="text-left py-2 px-3">Product</th>
                <th className="text-center py-2 px-3">Qty</th>
                <th className="text-center py-2 px-3">Unit</th>
                <th className="text-right py-2 px-3">Unit Price</th>
                <th className="text-right py-2 px-3">GST%</th>
                <th className="text-right py-2 px-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {quotation.lineItemDtoList.map((item) => (
                <tr
                  key={item.lineItemId}
                  style={{ borderBottom: "1px solid #f5f5f5" }}
                >
                  <td className="py-2 px-3">{item.productName}</td>
                  <td className="text-center py-2 px-3">{item.quantity}</td>
                  <td className="text-center py-2 px-3">{item.unit}</td>
                  <td className="text-right py-2 px-3">₹{item.unitPrice}</td>
                  <td className="text-right py-2 px-3">
                    {item.gstPercentage}%
                  </td>
                  <td className="text-right py-2 px-3">₹{item.totalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </Box>
    </Card>
  );
};

export default QuotationCard;
