// models/Clinic.ts
export interface Clinic {
  id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
}
