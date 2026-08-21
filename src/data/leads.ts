// Estrutura de dados de lead — pronta para futura integração com CRM.
export type LeadStatus = "Novo" | "Contactado" | "Interessado" | "Inscrito" | "Convertido";

export type Lead = {
  name: string;
  email: string;
  phone: string;
  interest?: string;
  origin: string;
  course?: string;
  company?: string;
  status: LeadStatus;
};

export type CorporateLead = Lead & {
  role?: string;
  participants?: string;
  preferredModality?: string;
  trainingNeed?: string;
  message?: string;
};
