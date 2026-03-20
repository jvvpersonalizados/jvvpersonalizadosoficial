const API_URL = "https://script.google.com/macros/s/AKfycbyJp42SCiA3aiuFZIuZLCKYNRvSXplfGYTM--GO9w8ER8v7fj69PlWd0lXjMSxvVSY/exec";

export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export const apiService = {
  async post(action: string, payload: any): Promise<ApiResponse> {
    try {
      // Google Apps Script requires a POST request with parameters or a JSON body
      // We use a URLSearchParams approach or raw JSON depending on how the script is written.
      // Most common is sending a JSON string in the body.
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8", // Avoid CORS preflight if possible, or use application/json
        },
        body: JSON.stringify({ action, ...payload }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        return { success: true, data: text };
      }
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
      const response = await fetch("/api/sync-catalog");
      return await response.json();
    } catch (error) {
      return { success: false, message: "Erro ao sincronizar catálogo." };
    }
  },

  async getCatalog() {
    const response = await this.post("getCatalog", {});
    return response.success ? response.data : [];
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

  async forgotPassword(email: string) {
    return this.post("forgotPassword", { email });
  }
};
