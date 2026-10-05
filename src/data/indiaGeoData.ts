// Geographic coordinates for key Indian states, regions, and major coastal hazard lines

export interface StateBoundary {
  name: string;
  center: [number, number];
  points: [number, number][];
}

export const KEY_INDIAN_STATES: StateBoundary[] = [
  {
    name: 'West Bengal',
    center: [23.5, 87.8],
    points: [
      [27.1, 88.3], [26.8, 89.8], [26.3, 89.8], [25.5, 88.0],
      [24.5, 88.7], [22.8, 88.9], [21.6, 88.8], [21.7, 87.5],
      [22.4, 86.8], [23.8, 86.8], [25.0, 87.8], [27.1, 88.3]
    ]
  },
  {
    name: 'Assam / Northeast',
    center: [26.2, 92.5],
    points: [
      [27.9, 96.0], [27.0, 94.0], [26.0, 93.0], [24.5, 92.8],
      [25.0, 91.0], [26.0, 90.0], [26.9, 89.9], [27.8, 92.0], [27.9, 96.0]
    ]
  },
  {
    name: 'Odisha',
    center: [20.5, 84.5],
    points: [
      [22.4, 86.8], [21.5, 87.1], [19.3, 85.0], [18.2, 84.0],
      [18.5, 82.5], [20.5, 82.6], [22.0, 84.0], [22.4, 86.8]
    ]
  },
  {
    name: 'Delhi NCR / Haryana',
    center: [28.6, 77.2],
    points: [
      [29.5, 76.5], [29.2, 77.5], [28.4, 77.7], [27.9, 77.0],
      [28.1, 76.2], [29.0, 76.0], [29.5, 76.5]
    ]
  },
  {
    name: 'Maharashtra',
    center: [19.5, 75.5],
    points: [
      [21.5, 73.0], [21.8, 77.0], [20.0, 80.5], [18.5, 80.0],
      [16.0, 74.0], [18.5, 72.8], [20.0, 72.7], [21.5, 73.0]
    ]
  },
  {
    name: 'Karnataka / Deccan',
    center: [14.5, 75.8],
    points: [
      [17.5, 77.0], [16.0, 77.5], [13.0, 78.0], [11.8, 76.5],
      [13.0, 74.8], [15.0, 74.0], [17.0, 75.5], [17.5, 77.0]
    ]
  },
  {
    name: 'Bihar',
    center: [25.6, 85.8],
    points: [
      [27.4, 84.0], [27.0, 88.0], [25.0, 87.8], [24.5, 83.5],
      [25.5, 84.0], [27.4, 84.0]
    ]
  }
];

// Major Indian cities for quick lookup and navigation
export interface CityMarker {
  name: string;
  state: string;
  region: string;
  lat: number;
  lng: number;
  type: 'METRO' | 'TIER_1' | 'RADAR_SITE' | 'HILL_STATION';
  population: string;
}

export const MAJOR_CITIES: CityMarker[] = [
  { name: 'Kolkata', state: 'West Bengal', region: 'East', lat: 22.5726, lng: 88.3639, type: 'METRO', population: '14.9M' },
  { name: 'New Delhi', state: 'Delhi NCR', region: 'North', lat: 28.6139, lng: 77.2090, type: 'METRO', population: '32.9M' },
  { name: 'Noida', state: 'Uttar Pradesh', region: 'North', lat: 28.5355, lng: 77.3910, type: 'METRO', population: '1.2M' },
  { name: 'Gurugram', state: 'Haryana', region: 'North', lat: 28.4595, lng: 77.0266, type: 'METRO', population: '1.5M' },
  { name: 'Mumbai', state: 'Maharashtra', region: 'West', lat: 19.0760, lng: 72.8777, type: 'METRO', population: '21.3M' },
  { name: 'Bengaluru', state: 'Karnataka', region: 'South', lat: 12.9716, lng: 77.5946, type: 'METRO', population: '13.2M' },
  { name: 'Hyderabad', state: 'Telangana', region: 'South', lat: 17.3850, lng: 78.4867, type: 'METRO', population: '10.5M' },
  { name: 'Chennai', state: 'Tamil Nadu', region: 'South', lat: 13.0827, lng: 80.2707, type: 'METRO', population: '11.5M' },
  { name: 'Pune', state: 'Maharashtra', region: 'West', lat: 18.5204, lng: 73.8567, type: 'METRO', population: '7.4M' },
  { name: 'Ahmedabad', state: 'Gujarat', region: 'West', lat: 23.0225, lng: 72.5714, type: 'METRO', population: '8.4M' },
  { name: 'Surat', state: 'Gujarat', region: 'West', lat: 21.1702, lng: 72.8311, type: 'TIER_1', population: '6.5M' },
  { name: 'Vadodara', state: 'Gujarat', region: 'West', lat: 22.3072, lng: 73.1812, type: 'TIER_1', population: '2.2M' },
  { name: 'Rajkot', state: 'Gujarat', region: 'West', lat: 22.3039, lng: 70.8022, type: 'TIER_1', population: '1.8M' },
  { name: 'Guwahati', state: 'Assam', region: 'Northeast', lat: 26.1445, lng: 91.7362, type: 'TIER_1', population: '1.2M' },
  { name: 'Bhubaneswar', state: 'Odisha', region: 'East', lat: 20.2961, lng: 85.8245, type: 'TIER_1', population: '1.1M' },
  { name: 'Cuttack', state: 'Odisha', region: 'East', lat: 20.4625, lng: 85.8828, type: 'TIER_1', population: '700K' },
  { name: 'Patna', state: 'Bihar', region: 'East', lat: 25.5941, lng: 85.1376, type: 'TIER_1', population: '2.5M' },
  { name: 'Gaya', state: 'Bihar', region: 'East', lat: 24.7914, lng: 85.0002, type: 'TIER_1', population: '500K' },
  { name: 'Muzaffarpur', state: 'Bihar', region: 'East', lat: 26.1209, lng: 85.3647, type: 'TIER_1', population: '450K' },
  { name: 'Lucknow', state: 'Uttar Pradesh', region: 'North', lat: 26.8467, lng: 80.9462, type: 'TIER_1', population: '3.8M' },
  { name: 'Kanpur', state: 'Uttar Pradesh', region: 'North', lat: 26.4499, lng: 80.3319, type: 'TIER_1', population: '3.2M' },
  { name: 'Varanasi', state: 'Uttar Pradesh', region: 'North', lat: 25.3176, lng: 82.9739, type: 'TIER_1', population: '1.7M' },
  { name: 'Prayagraj / Allahabad', state: 'Uttar Pradesh', region: 'North', lat: 25.4358, lng: 81.8463, type: 'TIER_1', population: '1.5M' },
  { name: 'Agra', state: 'Uttar Pradesh', region: 'North', lat: 27.1767, lng: 78.0081, type: 'TIER_1', population: '1.9M' },
  { name: 'Meerut', state: 'Uttar Pradesh', region: 'North', lat: 28.9845, lng: 77.7064, type: 'TIER_1', population: '1.6M' },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', region: 'North', lat: 28.6692, lng: 77.4538, type: 'TIER_1', population: '2.4M' },
  { name: 'Jaipur', state: 'Rajasthan', region: 'North', lat: 26.9124, lng: 75.7873, type: 'TIER_1', population: '4.0M' },
  { name: 'Jodhpur', state: 'Rajasthan', region: 'North', lat: 26.2389, lng: 73.0243, type: 'TIER_1', population: '1.4M' },
  { name: 'Udaipur', state: 'Rajasthan', region: 'North', lat: 24.5854, lng: 73.7125, type: 'TIER_1', population: '650K' },
  { name: 'Kota', state: 'Rajasthan', region: 'North', lat: 25.2138, lng: 75.8648, type: 'TIER_1', population: '1.2M' },
  { name: 'Indore', state: 'Madhya Pradesh', region: 'Central', lat: 22.7196, lng: 75.8577, type: 'TIER_1', population: '3.3M' },
  { name: 'Bhopal', state: 'Madhya Pradesh', region: 'Central', lat: 23.2599, lng: 77.4126, type: 'TIER_1', population: '2.4M' },
  { name: 'Gwalior', state: 'Madhya Pradesh', region: 'Central', lat: 26.2183, lng: 78.1828, type: 'TIER_1', population: '1.3M' },
  { name: 'Jabalpur', state: 'Madhya Pradesh', region: 'Central', lat: 23.1815, lng: 79.9864, type: 'TIER_1', population: '1.4M' },
  { name: 'Nagpur', state: 'Maharashtra', region: 'Central', lat: 21.1458, lng: 79.0882, type: 'TIER_1', population: '2.9M' },
  { name: 'Nashik', state: 'Maharashtra', region: 'West', lat: 19.9975, lng: 73.7898, type: 'TIER_1', population: '2.1M' },
  { name: 'Aurangabad / Chhatrapati Sambhajinagar', state: 'Maharashtra', region: 'West', lat: 19.8762, lng: 75.3433, type: 'TIER_1', population: '1.5M' },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', region: 'South', lat: 17.6868, lng: 83.2185, type: 'TIER_1', population: '2.3M' },
  { name: 'Vijayawada', state: 'Andhra Pradesh', region: 'South', lat: 16.5062, lng: 80.6480, type: 'TIER_1', population: '1.7M' },
  { name: 'Tirupati', state: 'Andhra Pradesh', region: 'South', lat: 13.6288, lng: 79.4192, type: 'TIER_1', population: '460K' },
  { name: 'Kochi', state: 'Kerala', region: 'South', lat: 9.9312, lng: 76.2673, type: 'TIER_1', population: '2.1M' },
  { name: 'Thiruvananthapuram', state: 'Kerala', region: 'South', lat: 8.5241, lng: 76.9366, type: 'TIER_1', population: '1.7M' },
  { name: 'Kozhikode', state: 'Kerala', region: 'South', lat: 11.2588, lng: 75.7804, type: 'TIER_1', population: '900K' },
  { name: 'Coimbatore', state: 'Tamil Nadu', region: 'South', lat: 11.0168, lng: 76.9558, type: 'TIER_1', population: '2.9M' },
  { name: 'Madurai', state: 'Tamil Nadu', region: 'South', lat: 9.9252, lng: 78.1198, type: 'TIER_1', population: '1.8M' },
  { name: 'Trichy', state: 'Tamil Nadu', region: 'South', lat: 10.7905, lng: 78.7047, type: 'TIER_1', population: '1.1M' },
  { name: 'Salem', state: 'Tamil Nadu', region: 'South', lat: 11.6643, lng: 78.1460, type: 'TIER_1', population: '1.0M' },
  { name: 'Mysuru', state: 'Karnataka', region: 'South', lat: 12.2958, lng: 76.6394, type: 'TIER_1', population: '1.2M' },
  { name: 'Mangaluru', state: 'Karnataka', region: 'South', lat: 12.9141, lng: 74.8560, type: 'TIER_1', population: '700K' },
  { name: 'Hubli-Dharwad', state: 'Karnataka', region: 'South', lat: 15.3647, lng: 75.1240, type: 'TIER_1', population: '1.1M' },
  { name: 'Chandigarh', state: 'Punjab / Haryana', region: 'North', lat: 30.7333, lng: 76.7794, type: 'TIER_1', population: '1.2M' },
  { name: 'Amritsar', state: 'Punjab', region: 'North', lat: 31.6340, lng: 74.8723, type: 'TIER_1', population: '1.4M' },
  { name: 'Ludhiana', state: 'Punjab', region: 'North', lat: 30.9010, lng: 75.8573, type: 'TIER_1', population: '1.8M' },
  { name: 'Dehradun', state: 'Uttarakhand', region: 'North', lat: 30.3165, lng: 78.0322, type: 'HILL_STATION', population: '800K' },
  { name: 'Haridwar / Rishikesh', state: 'Uttarakhand', region: 'North', lat: 29.9457, lng: 78.1642, type: 'TIER_1', population: '350K' },
  { name: 'Shimla', state: 'Himachal Pradesh', region: 'North', lat: 31.1048, lng: 77.1734, type: 'HILL_STATION', population: '220K' },
  { name: 'Dharamshala', state: 'Himachal Pradesh', region: 'North', lat: 32.2190, lng: 76.3234, type: 'HILL_STATION', population: '60K' },
  { name: 'Srinagar', state: 'Jammu & Kashmir', region: 'North', lat: 34.0837, lng: 74.7973, type: 'HILL_STATION', population: '1.5M' },
  { name: 'Jammu', state: 'Jammu & Kashmir', region: 'North', lat: 32.7266, lng: 74.8570, type: 'TIER_1', population: '700K' },
  { name: 'Leh / Ladakh', state: 'Ladakh', region: 'North', lat: 34.1526, lng: 77.5771, type: 'HILL_STATION', population: '45K' },
  { name: 'Siliguri / Darjeeling', state: 'West Bengal', region: 'East', lat: 26.7271, lng: 88.3953, type: 'TIER_1', population: '750K' },
  { name: 'Durgapur / Asansol', state: 'West Bengal', region: 'East', lat: 23.5204, lng: 87.3119, type: 'TIER_1', population: '1.3M' },
  { name: 'Ranchi', state: 'Jharkhand', region: 'East', lat: 23.3441, lng: 85.3096, type: 'TIER_1', population: '1.5M' },
  { name: 'Jamshedpur', state: 'Jharkhand', region: 'East', lat: 22.8046, lng: 86.2029, type: 'TIER_1', population: '1.6M' },
  { name: 'Dhanbad', state: 'Jharkhand', region: 'East', lat: 23.7957, lng: 86.4304, type: 'TIER_1', population: '1.3M' },
  { name: 'Raipur', state: 'Chhattisgarh', region: 'Central', lat: 21.2514, lng: 81.6296, type: 'TIER_1', population: '1.8M' },
  { name: 'Bilaspur', state: 'Chhattisgarh', region: 'Central', lat: 22.0797, lng: 82.1409, type: 'TIER_1', population: '550K' },
  { name: 'Agartala', state: 'Tripura', region: 'Northeast', lat: 23.8315, lng: 91.2868, type: 'TIER_1', population: '520K' },
  { name: 'Shillong', state: 'Meghalaya', region: 'Northeast', lat: 25.5788, lng: 91.8933, type: 'HILL_STATION', population: '380K' },
  { name: 'Imphal', state: 'Manipur', region: 'Northeast', lat: 24.8170, lng: 93.9368, type: 'TIER_1', population: '420K' },
  { name: 'Aizawl', state: 'Mizoram', region: 'Northeast', lat: 23.7271, lng: 92.7176, type: 'HILL_STATION', population: '320K' },
  { name: 'Kohima', state: 'Nagaland', region: 'Northeast', lat: 25.6751, lng: 94.1086, type: 'HILL_STATION', population: '130K' },
  { name: 'Itanagar', state: 'Arunachal Pradesh', region: 'Northeast', lat: 27.0844, lng: 93.6053, type: 'HILL_STATION', population: '100K' },
  { name: 'Gangtok', state: 'Sikkim', region: 'Northeast', lat: 27.3389, lng: 88.6065, type: 'HILL_STATION', population: '120K' },
  { name: 'Panaji / Goa', state: 'Goa', region: 'West', lat: 15.4909, lng: 73.8278, type: 'RADAR_SITE', population: '115K' },
  { name: 'Puducherry', state: 'Puducherry', region: 'South', lat: 11.9416, lng: 79.8083, type: 'TIER_1', population: '400K' },
  { name: 'Port Blair', state: 'Andaman & Nicobar', region: 'South', lat: 11.6234, lng: 92.7265, type: 'RADAR_SITE', population: '140K' }
];
