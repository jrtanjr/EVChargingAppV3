// ================= TYPES =================
type Connector = {
  type: string;
  current_type: string;
  power_kw: number;
  quantity: number;
  available: number;
};

type Station = {
  id: number;
  name: string;
  provider: string;
  address: string;
  latitude: number;
  longitude: number;
  total_ports: number;
  available_ports: number;
  connectors: Connector[];
};

// ================= API FETCH =================
export const fetchStationsFromAPI = async (): Promise<any[]> => {
  try {
    const response = await fetch(
      'https://api.openchargemap.io/v3/poi/?output=json&countrycode=MY&maxresults=20&key=bc445262-b266-463f-a312-a07b60bc249c'
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.log('API Error:', error);
    return [];
  }
};

// ================= TRANSFORM =================
export const transformStations = (apiData: any[]): Station[] => {
  return apiData
    .filter(
      (item: any) =>
        item.AddressInfo?.Latitude && item.AddressInfo?.Longitude
    )
    .map((item: any): Station => {
      const connections = item.Connections || [];

      // Build connectors list
      const connectors: Connector[] = connections.map((conn: any) => {
        const quantity = conn.Quantity || 1;

        // Simulated availability
        const available = Math.floor(Math.random() * (quantity + 1));

        return {
          type: conn.ConnectionType?.Title || 'Unknown',
          current_type: conn.CurrentType?.Title || 'Unknown',
          power_kw: conn.PowerKW || 0,
          quantity,
          available,
        };
      });

      // Calculate totals
      const totalPortsFinal =
        connectors.reduce(
          (sum: number, c: Connector) => sum + c.quantity,
          0
        ) ||
        item.NumberOfPoints ||
        0;

      const availablePorts = connectors.reduce(
        (sum: number, c: Connector) => sum + c.available,
        0
      );

      // Return formatted station
      return {
        id: Number(item.ID),
        name: item.AddressInfo?.Title || 'Unknown',
        provider: item.OperatorInfo?.Title || 'Independent Charger',
        address: [
          item.AddressInfo?.AddressLine1,
          item.AddressInfo?.Town,
          item.AddressInfo?.StateOrProvince,
          item.AddressInfo?.Postcode,
          item.AddressInfo?.Country?.Title,
        ]
          .filter(Boolean)
          .join(', '),
        
        latitude: Number(item.AddressInfo.Latitude),
        longitude: Number(item.AddressInfo.Longitude),

        total_ports: totalPortsFinal,
        available_ports: availablePorts,

        connectors,
      };
    });
};

// ================= Calculate Distance =================
export const getDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 6371; // Earth radius (km)

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};