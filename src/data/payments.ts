export type PaymentStatus = "Pendente" | "Pago" | "Reembolsado";

export type Payment = {
  studentId: string;
  courseSlug: string;
  amount: string;
  status: PaymentStatus;
  date: string;
};

// Sem integração de pagamentos ainda.
export const payments: Payment[] = [];
