import axios from "axios";

export const makePaymentRequest = axios.create({
  baseURL: "/api",
});
