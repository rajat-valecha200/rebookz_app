export interface User {
  id: string;
  name: string;
  phone: string;
  location: {
    city: string;
    lat: number;
    lng: number;
  };
}
