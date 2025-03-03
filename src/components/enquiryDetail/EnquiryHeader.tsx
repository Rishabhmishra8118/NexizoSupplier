import { Button, Card, TabNav } from "@radix-ui/themes";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

const EnquiryHeader = () => {
  const navigate = useNavigate();

  return (
    <>
      <Button
        size="1"
        variant="soft"
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft height="16px" width="16px" /> Back
      </Button>
      <Card style={{ paddingBottom: 0 }} className="mt-4 rounded-lg">
        <TabNav.Root>
          <TabNav.Link href="#" active>
            Overview
          </TabNav.Link>
          <TabNav.Link href="#">Contacts</TabNav.Link>
          <TabNav.Link href="#">Location</TabNav.Link>
          <TabNav.Link href="#">Past Transaction</TabNav.Link>
        </TabNav.Root>
      </Card>
    </>
  );
};

export default EnquiryHeader;
