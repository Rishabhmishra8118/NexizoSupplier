import { format } from "date-fns";
import { formatDistanceToNow } from "date-fns";

export const formatTimestamp = (timestamp: number): string => {
  return format(new Date(timestamp), "d MMMM yyyy");
};

export const timeAgo = (timestamp: number): string => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};
