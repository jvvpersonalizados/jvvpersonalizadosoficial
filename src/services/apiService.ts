export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export const apiService = {
  getApiUrl(path: string) {
    const baseUrl = (import.meta as any).env.VITE_API_URL || "";
    return `${baseUrl}${path}`;
  },

  async post(action: string, payload: any): Promise<ApiResponse> {
    try {
      // Use the local proxy to avoid CORS issues with Google Apps Script
      const response = await fetch(this.getApiUrl("/api/gas-proxy"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, ...payload }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API Error:", error);
      return { success: false, message: "Erro na comunicação com o servidor galáctico." };
    }
  },

  async login(email: string, pass: string) {
    return this.post("login", { email, pass });
  },

  async register(userData: any) {
    return this.post("register", userData);
  },

  async calculateShipping(cep: string) {
    return this.post("calculateShipping", { cep });
  },

  async saveOrder(orderData: any) {
    return this.post("saveOrder", orderData);
  },

  async syncCatalog() {
    try {
      const response = await fetch(this.getApiUrl("/api/sync-catalog"));
      return await response.json();
    } catch (error) {
      return { success: false, message: "Erro ao sincronizar catálogo." };
    }
  },

  async getCatalog() {
    const response = await this.post("getCatalog", {});
    if (response.success) {
      if (Array.isArray(response.data)) return response.data;
      if (typeof response.data === 'string') {
        try {
          const parsed = JSON.parse(response.data);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  },

  async getOrders() {
    return this.post("getOrders", {});
  },

  async updateOrderStatus(orderId: string, status: string) {
    return this.post("updateOrderStatus", { orderId, status });
  },

  async getAdminStats() {
    return this.post("getAdminStats", {});
  },

  async updateProduct(productId: string, data: any) {
    return this.post("updateProduct", { productId, ...data });
  },

  async addProduct(product: any) {
    return this.post("addProduct", product);
  },

  async getUsers() {
    return this.post("getUsers", {});
  },

  async deleteUser(userId: string) {
    return this.post("deleteUser", { userId });
  },

  async deleteProduct(productId: string) {
    return this.post("deleteProduct", { productId });
  },

  async getBanners() {
    return this.post("getBanners", {});
  },

  async addBanner(banner: any) {
    return this.post("addBanner", banner);
  },

  async updateBanner(bannerId: string, data: any) {
    return this.post("updateBanner", { bannerId, ...data });
  },

  async deleteBanner(bannerId: string) {
    return this.post("deleteBanner", { bannerId });
  },

  async forgotPassword(email: string) {
    return this.post("forgotPassword", { email });
  }
};
