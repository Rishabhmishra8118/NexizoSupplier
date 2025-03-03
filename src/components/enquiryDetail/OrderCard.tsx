import { Badge, Box, Card, Flex, Separator, Text } from "@radix-ui/themes";
import {
  Building,
  CalendarIcon,
  FileCheck,
  FileText,
  IndianRupee,
  Truck,
  UserPlus,
} from "lucide-react";
import { formatTimestamp } from "../../utils/Commons";
import { SalesOrder } from "../../types/enquiry";

interface OrderCardProps {
  order: SalesOrder;
}

const OrderCard = ({ order }: OrderCardProps) => {
  return (
    <Card className="rounded-lg p-4 mt-4">
      <Flex justify="between" align="center" className="mb-4">
        <Flex align="center" gap="2">
          <Text size="2" weight="bold">
            Order Details
          </Text>
        </Flex>
        <Flex gap="2">
          <Badge color="green" radius="full">
            {order.salesOrderStatus}
          </Badge>
          <Badge color="blue" radius="full">
            Order #{order.orderNumber}
          </Badge>
        </Flex>
      </Flex>

      <Flex wrap="wrap" gap="4">
        {/* Price Information Card */}
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
              <Text size="1">₹{order.totalItemPrice}</Text>
            </Flex>
            <Flex justify="between">
              <Text size="1" color="gray">
                GST:
              </Text>
              <Text size="1">₹{order.gstAmount}</Text>
            </Flex>
            <Separator my="1" size="4" />
            <Flex justify="between">
              <Text size="1" weight="bold">
                Total:
              </Text>
              <Text size="1" weight="bold">
                ₹{order.totalPrice}
              </Text>
            </Flex>
          </Flex>
        </Card>

        {/* Delivery & Payment Card */}
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
              <Text size="1">
                {formatTimestamp(order.expectedDeliveryDate)}
              </Text>
            </Flex>
            <Flex align="center" gap="1">
              <FileText size={14} />
              <Text size="1" color="gray">
                Payment Terms:
              </Text>
              <Text size="1">{order.paymentTerm.displayName}</Text>
            </Flex>
            {order.poNumber && (
              <Flex align="center" gap="1">
                <FileCheck size={14} />
                <Text size="1" color="gray">
                  PO Number:
                </Text>
                <Text size="1">{order.poNumber}</Text>
              </Flex>
            )}
          </Flex>
        </Card>
      </Flex>

      {/* Address Information */}
      <Card className="p-3 mt-4">
        <Flex align="center" gap="2" mb="2">
          <Building size={18} />
          <Text size="2" weight="bold">
            Address Details
          </Text>
        </Flex>
        <Flex wrap="wrap" gap="4" className="mt-2">
          <Box className="grow" style={{ minWidth: "200px" }}>
            <Text size="1" weight="bold" mb="1">
              Shipping Address :{" "}
            </Text>
            <Text size="1">
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 &&
                `, ${order.shippingAddress.addressLine2}`}
            </Text>
            <Text size="1">
              {order.shippingAddress.cityStateDisplayString},{" "}
              {order.shippingAddress.pinCode}
            </Text>
          </Box>
          <Box className="grow" style={{ minWidth: "200px" }}>
            <Text size="1" weight="bold" mb="1">
              Billing Address :{" "}
            </Text>
            <Text size="1">
              {order.buyerBillingAddress.addressLine1}
              {order.buyerBillingAddress.addressLine2 &&
                `, ${order.buyerBillingAddress.addressLine2}`}
            </Text>
            <Text size="1">
              {order.buyerBillingAddress.cityStateDisplayString},{" "}
              {order.buyerBillingAddress.pinCode}
            </Text>
          </Box>
        </Flex>
      </Card>

      {/* Additional Information */}
      {(order.instructions || order.notes) && (
        <Card className="p-3 mt-4">
          <Text size="2" weight="bold" mb="2">
            Additional Information
          </Text>
          {order.instructions && (
            <Box className="mb-2">
              <Text size="1" weight="bold">
                Instructions:
              </Text>
              <Text size="1">{order.instructions}</Text>
            </Box>
          )}
          {order.notes && (
            <Box>
              <Text size="1" weight="bold">
                Notes:
              </Text>
              <Text size="1">{order.notes}</Text>
            </Box>
          )}
        </Card>
      )}

      {/* Assigned To */}
      <Card className="p-3 mt-4">
        <Flex align="center" gap="2">
          <UserPlus size={16} />
          <Text size="2" weight="bold">
            Order Assigned To
          </Text>
          <Badge color="blue" radius="full">
            {order.assigneeName}
          </Badge>
        </Flex>
      </Card>
    </Card>
  );
};

export default OrderCard;
