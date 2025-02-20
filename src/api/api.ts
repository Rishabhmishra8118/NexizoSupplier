import apiClient from "./apiClient";

const apiList = {
  async getStatusCount(organizationId: string) {
    try {
      const response = await apiClient.get(
        `/api/v1/partner/enquiry/statusCount/${organizationId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching status count:", error);
      throw error;
    }
  },

  async getEnquiries(organizationId: string, params: object) {
    try {
      const response = await apiClient.get(
        `/api/v1/partner/enquiry/search/${organizationId}`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      throw error;
    }
  },

  async updateEnquiryStatus(
    organizationId: string,
    enquiryId: string,
    status: string,
    remarks: string
  ) {
    try {
      const response = await apiClient.put(
        `/api/v1/partner/enquiry/updateStatus/${organizationId}/${enquiryId}`,
        { status, remarks },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating enquiry status:", error);
      throw error;
    }
  },

  async getEnquiryById(organizationId: string, enquiryId: string) {
    try {
      const response = await apiClient.get(
        `/api/v1/partner/enquiry/detail/${organizationId}/${enquiryId}`
      );
      return response.data;
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching enquiry by id:", error);
      throw error;
    }
  },

  async getEmployeByOrgId(organizationId: string) {
    try {
      const response = await apiClient.get(
        `/api/v1/partner/enquiry/orgEmployee/list/${organizationId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching employee by organization id:", error);
      throw error;
    }
  },

  async assignTeamMember(
    organizationId: string,
    enquiryId: string,
    pocName: string,
    emailAddresses: string[],
    mobileNumbers: string[],
    pocId: string
  ) {
    try {
      const response = await apiClient.put(
        `/api/v1/partner/enquiry/assignTeamMember/${organizationId}/${enquiryId}`,
        {
          pocName,
          emailAddresses,
          mobileNumbers,
          pocId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error assigning team member:", error);
      throw error;
    }
  },

  async enquiryBulkAction(
    organizationId: string,
    salesEnquiryIds: string[],
    pocInfo: PocInfo,
    status: string,
    remarks: string
  ) {
    try {
      const response = await apiClient.put(
        `/api/v1/partner/enquiry/bulkAction/${organizationId}`,
        {
          salesEnquiryIds,
          status,
          pocInfo,
          remarks,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating enquiry status:", error);
      throw error;
    }
  },
};

interface PocInfo {
  pocName: string;
  emailAddresses: string[];
  mobileNumbers: string[];
  pocId: string;
}

export default apiList;
