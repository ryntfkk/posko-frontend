export interface Address {
  _id: string;
  userId: string;
  label: string;
  detail: string;
  village?: string;
  district?: string;
  city: string;
  province: string;
  postalCode: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressesResponse {
  success: boolean;
  data: Address[];
}

export interface AddressResponse {
  success: boolean;
  data: Address;
}

export interface CreateAddressPayload {
  label: string;
  detail: string;
  village?: string;
  district?: string;
  city: string;
  province: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
}

export type UpdateAddressPayload = Partial<CreateAddressPayload>;

