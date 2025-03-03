import { Badge, Box, Card, Flex, Text } from "@radix-ui/themes";

import { formatTimestamp } from "../../utils/Commons";

interface StatusHistory {
  dateCreated: number;
  status: string;
  remarks: string;
  statusDisplayValue: string;
}

interface StatusUpdateCardProps {
  statusHistory: StatusHistory[];
}

const StatusUpdateCard = ({ statusHistory }: StatusUpdateCardProps) => {
  // Sort status history by date (newest first)
  const sortedHistory = [...statusHistory].sort(
    (a, b) =>
      new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
  );

  return (
    <Card className="mt-4 p-4">
      <Flex align="center" mb="4">
        <Text size="2" weight="bold">
          Status Timeline
        </Text>
      </Flex>

      <Box className="relative ml-3 pl-6 mt-6">
        {/* Vertical timeline line */}
        {sortedHistory.length > 1 && (
          <Box
            className="absolute left-0 top-0 bottom-0 w-px bg-gray-200"
            style={{
              height: `calc(100% - 24px)`,
              marginLeft: "7px",
            }}
          />
        )}

        {sortedHistory.map((status, index) => (
          <Flex key={index} className="mb-6 relative" direction="column">
            {/* Status point/dot */}
            <Box
              className="absolute -left-6 rounded-full flex items-center justify-center z-10"
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: index === 0 ? "#00CC00" : "#6600FF", // Green for current, purple for past
                marginTop: "4px",
              }}
            />

            {/* Status content */}
            <Box className="ml-1">
              <Flex gap="2" align="center" mb="1">
                <Text size="2" weight="medium" color="gray">
                  {formatTimestamp(status.dateCreated)}
                </Text>
                <Badge size="1" color="orange" radius="full">
                  {status.statusDisplayValue}
                </Badge>
              </Flex>

              {status.remarks && (
                <Box className="mt-1">
                  <Text size="2">{status.remarks}</Text>
                </Box>
              )}
            </Box>
          </Flex>
        ))}
      </Box>
    </Card>
  );
};

export default StatusUpdateCard;
