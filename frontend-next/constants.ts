export const allCountries = [
  "Deutschland",
  "Österreich",
  "Schweiz",
  "Frankreich",
  "Italien",
  "Spanien",
  "Niederlande",
  "Belgien",
  "Polen",
  "Tschechien",
  "USA",
  "Kanada",
  "Vereinigtes Königreich",
  "Schweden",
  "Norwegen",
  "Dänemark",
  "Finnland",
  "Australien",
];

export interface UserAcc {
  id: string;
  firstname: string;
  name: string;
  email: string;
  isAdmin: boolean;
  street: string;
  hNumber: string;
  pCode: string;
  town: string;
  country: string;
}