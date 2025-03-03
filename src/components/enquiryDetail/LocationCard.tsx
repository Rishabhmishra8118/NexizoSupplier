import { Box, Card, Flex, Text } from "@radix-ui/themes";
import { MapPin, Building, List } from "lucide-react";

interface LocationCardProps {
  shippingAddress?: {
    city?: string;
    state?: string;
    cityStateDisplayString?: string;
  };
  billingAddress?: {
    city?: string;
    state?: string;
    cityStateDisplayString?: string;
  };
}

const LocationCard = ({
  shippingAddress,
  billingAddress,
}: LocationCardProps) => {
  // Get formatted location string or fallback to individual city/state
  const getSiteLocation = () => {
    if (shippingAddress?.cityStateDisplayString) {
      return shippingAddress.cityStateDisplayString;
    }

    if (shippingAddress?.city || shippingAddress?.state) {
      return `${shippingAddress.city || ""}, ${
        shippingAddress.state || ""
      }`.replace(/(^,\s*)|(\s*,\s*$)/g, "");
    }

    return "Location not specified";
  };

  const getCompanyLocation = () => {
    if (billingAddress?.cityStateDisplayString) {
      return billingAddress.cityStateDisplayString;
    }

    if (billingAddress?.city || billingAddress?.state) {
      return `${billingAddress.city || ""}, ${
        billingAddress.state || ""
      }`.replace(/(^,\s*)|(\s*,\s*$)/g, "");
    }

    return "Location not specified";
  };

  return (
    <Card className="mt-4 p-4">
      <Flex align="center" gap="2" mb="4">
        <Text size="2" weight="bold">
          Location Information
        </Text>
      </Flex>

      <Box className="p-2">
        <Flex direction="column" gap="3">
          <Flex gap="3" align="center">
            <Flex gap="2" align="center" style={{ minWidth: "160px" }}>
              <MapPin size={16} className="text-gray-500" />
              <Text size="2" color="gray">
                Site Location:
              </Text>
            </Flex>
            <Text size="2" weight="medium">
              {getSiteLocation()}
            </Text>
          </Flex>

          <Flex gap="3" align="center">
            <Flex gap="2" align="center" style={{ minWidth: "160px" }}>
              <Building size={16} className="text-gray-500" />
              <Text size="2" color="gray">
                Company Location:
              </Text>
            </Flex>
            <Text size="2" weight="medium">
              {getCompanyLocation()}
            </Text>
          </Flex>
          <Flex gap="3" align="center">
            <Flex gap="2" align="center" style={{ minWidth: "160px" }}>
              <List size={16} className="text-gray-500" />
              <Text size="2" color="gray">
                Project:
              </Text>
            </Flex>
            <Text size="2" weight="medium">
              {"-"}
            </Text>
          </Flex>
        </Flex>
      </Box>
    </Card>
  );
};

export default LocationCard;
