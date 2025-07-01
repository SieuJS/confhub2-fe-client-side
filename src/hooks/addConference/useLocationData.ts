// src/hooks/addConference/useLocationData.ts

import { useState, useEffect, useCallback } from 'react';
import countryData from '@/src/app/[locale]/addconference/countries.json'; // Đảm bảo đường dẫn này chính xác
import {
  LocationInput,
  Country,
  State,
  City,
} from '@/src/models/send/addConference.send';

/**
 * Interface cho các props của hook useLocationData.
 */
interface UseLocationDataProps {
  location: LocationInput; // Giá trị location từ formData của component cha
  onLocationChange: (field: keyof LocationInput, value: string) => void; // Hàm callback để cập nhật formData ở cha
  cscApiKey: string;
  setStatesForReview: React.Dispatch<React.SetStateAction<State[]>>;
  setCitiesForReview: React.Dispatch<React.SetStateAction<City[]>>;
}

/**
 * Custom hook để quản lý logic phức tạp của việc chọn địa điểm (Châu lục -> Quốc gia -> Bang/Thành phố).
 */
export const useLocationData = ({
  location,
  onLocationChange,
  cscApiKey,
  setStatesForReview,
  setCitiesForReview,
}: UseLocationDataProps) => {
  // --- STATE QUẢN LÝ DỮ LIỆU THÔ ---
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  // --- STATE NỘI BỘ ĐỂ ĐIỀU KHIỂN UI ---
  // Các state này là "chìa khóa" để sửa lỗi. Chúng điều khiển giá trị của các thẻ <select>.
  // Chúng được cập nhật ngay lập tức khi người dùng tương tác,
  // và sau đó được đồng bộ hóa với `location` prop từ cha thông qua useEffect.
  const [internalSelectedContinent, setInternalSelectedContinent] = useState(location.continent || '');
  const [internalSelectedCountry, setInternalSelectedCountry] = useState(''); // Lưu trữ mã ISO2
  const [internalSelectedState, setInternalSelectedState] = useState('');     // Lưu trữ mã ISO2
  const [internalSelectedCity, setInternalSelectedCity] = useState('');       // Lưu trữ tên thành phố

  // --- HIỆU ỨNG (EFFECTS) ---

  // 1. Tải danh sách quốc gia từ file JSON (chỉ chạy 1 lần khi component mount).
  useEffect(() => {
    const mappedCountries: Country[] = countryData.map((c: any) => ({
      name: c.name,
      iso2: c.iso2,
      region: c.region, // Đảm bảo 'region' khớp với giá trị của continentOptions (ví dụ: 'Americas', 'Europe')
    }));
    setCountries(mappedCountries);
  }, []);

  // 2. Đồng bộ state nội bộ với props từ cha khi `location` (từ formData) thay đổi từ bên ngoài.
  // Điều này quan trọng khi load dữ liệu ban đầu hoặc khi form được reset từ cha.
  useEffect(() => {
    // Chỉ cập nhật internalSelectedContinent nếu location.continent thực sự thay đổi
    // để tránh việc ghi đè không cần thiết nếu người dùng vừa chọn.
    // Tuy nhiên, cách tiếp cận hiện tại là đồng bộ hóa hoàn toàn, điều này thường là mong muốn.
    setInternalSelectedContinent(location.continent || '');

    const matchedCountry = countries.find(c => c.name === location.country);
    setInternalSelectedCountry(matchedCountry?.iso2 || '');

    // Xử lý state/city dựa trên location.cityStateProvince
    // Cần cẩn thận ở đây để xác định đó là state hay city nếu API trả về cả hai
    if (location.cityStateProvince) {
      // Ưu tiên tìm state trước nếu states đã được load cho country hiện tại
      const currentCountryIso = matchedCountry?.iso2;
      if (currentCountryIso && states.length > 0) { // Kiểm tra states có thuộc country hiện tại không
        const matchedState = states.find(s => s.name === location.cityStateProvince);
        if (matchedState) {
          setInternalSelectedState(matchedState.iso2);
          setInternalSelectedCity(''); // Reset city nếu state được tìm thấy
        } else {
          // Nếu không tìm thấy state, có thể đó là city (cho các nước không có state)
          // Hoặc cityStateProvince là tên city
          const matchedCity = cities.find(c => c.name === location.cityStateProvince);
          if (matchedCity) {
            setInternalSelectedCity(matchedCity.name);
            setInternalSelectedState(''); // Reset state nếu city được tìm thấy
          } else {
            setInternalSelectedState('');
            setInternalSelectedCity('');
          }
        }
      } else if (currentCountryIso && cities.length > 0) { // Nếu không có state, kiểm tra cities
        const matchedCity = cities.find(c => c.name === location.cityStateProvince);
        if (matchedCity) {
          setInternalSelectedCity(matchedCity.name);
          setInternalSelectedState('');
        } else {
          setInternalSelectedState('');
          setInternalSelectedCity('');
        }
      } else {
        // Nếu chưa có states/cities load cho country, hoặc không có country
        // thì chưa thể xác định, tạm reset
        setInternalSelectedState('');
        setInternalSelectedCity('');
      }
    } else {
      setInternalSelectedState('');
      setInternalSelectedCity('');
    }
  }, [location, countries, states, cities]); // Thêm states, cities vào dependency array là đúng

  // 3. Lấy danh sách Bang/Thành phố khi quốc gia (internalSelectedCountry) được chọn thay đổi.
  useEffect(() => {
    if (!internalSelectedCountry) {
      setStates([]);
      setCities([]);
      setStatesForReview([]);
      setCitiesForReview([]);
      return;
    }
    const fetchStatesOrCities = async () => {
      try {
        const statesResponse = await fetch(`https://api.countrystatecity.in/v1/countries/${internalSelectedCountry}/states`, { headers: { 'X-CSCAPI-KEY': cscApiKey } });
        if (!statesResponse.ok) throw new Error(`State API Error: ${statesResponse.status} for country ${internalSelectedCountry}`);
        const statesData = await statesResponse.json();

        if (statesData && statesData.length > 0) {
          const mappedStates = statesData.map((s: any) => ({ name: s.name, iso2: s.iso2 })).sort((a: State, b: State) => a.name.localeCompare(b.name));
          setStates(mappedStates);
          setStatesForReview(mappedStates); // Cập nhật cho review
          setCities([]); // Reset cities khi có states
          setCitiesForReview([]);
        } else {
          // Nếu không có states, fetch cities
          setStates([]);
          setStatesForReview([]);
          const citiesResponse = await fetch(`https://api.countrystatecity.in/v1/countries/${internalSelectedCountry}/cities`, { headers: { 'X-CSCAPI-KEY': cscApiKey } });
          if (!citiesResponse.ok) throw new Error(`City API Error: ${citiesResponse.status} for country ${internalSelectedCountry}`);
          const citiesData: any[] = await citiesResponse.json(); // Explicitly type if possible, or use any[]

          if (Array.isArray(citiesData) && citiesData.length > 0) {
            const uniqueCitiesMap = new Map<string, City>();
            citiesData.forEach((apiCity: any) => { // Each item from the API
              if (apiCity && apiCity.name && !uniqueCitiesMap.has(apiCity.name)) {
                // Ensure all required fields are present and correctly typed if necessary,
                // though TypeScript will enforce the structure of the object literal below.
                const cityObject: City = {
                  name: apiCity.name,
                  country_code: apiCity.country_code,
                  state_code: apiCity.state_code,
                  latitude: apiCity.latitude,
                  longitude: apiCity.longitude,
                };
                uniqueCitiesMap.set(apiCity.name, cityObject);
              }
            });
            const sortedUniqueCities = Array.from(uniqueCitiesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
            setCities(sortedUniqueCities);
            setCitiesForReview(sortedUniqueCities); // Cập nhật cho review
          } else {
            setCities([]);
            setCitiesForReview([]);
          }
        }
      } catch (error) {
        // console.error('Error fetching location data (states/cities):', error);
        setStates([]); setCities([]);
        setStatesForReview([]); setCitiesForReview([]);
      }
    };
    fetchStatesOrCities();
  }, [internalSelectedCountry, cscApiKey, setStatesForReview, setCitiesForReview]);

  // --- HÀM XỬ LÝ SỰ KIỆN ---
  const handleContinentChange = useCallback((continent: string) => {
    setInternalSelectedContinent(continent); // Cập nhật UI ngay lập tức
    setInternalSelectedCountry(''); // Reset country khi continent thay đổi
    setInternalSelectedState('');   // Reset state
    setInternalSelectedCity('');    // Reset city

    onLocationChange('continent', continent); // Thông báo cho cha
    onLocationChange('country', '');          // Reset country ở form cha
    onLocationChange('cityStateProvince', '');// Reset cityStateProvince ở form cha
  }, [onLocationChange]);

  const handleCountryChange = useCallback((countryIso2: string) => {
    const countryObject = countries.find(c => c.iso2 === countryIso2);
    const countryName = countryObject?.name || '';

    setInternalSelectedCountry(countryIso2); // Cập nhật UI
    setInternalSelectedState('');
    setInternalSelectedCity('');

    onLocationChange('country', countryName); // Thông báo cho cha với tên quốc gia
    onLocationChange('cityStateProvince', '');
  }, [countries, onLocationChange]);

  const handleStateChange = useCallback((stateIso2: string) => {
    const stateObject = states.find(s => s.iso2 === stateIso2);
    const stateName = stateObject?.name || '';

    setInternalSelectedState(stateIso2); // Cập nhật UI
    setInternalSelectedCity(''); // Reset city khi state thay đổi

    onLocationChange('cityStateProvince', stateName); // Thông báo cho cha
  }, [states, onLocationChange]);

  const handleCityChange = useCallback((cityName: string) => {
    setInternalSelectedCity(cityName); // Cập nhật UI

    // Nếu quốc gia không có state, cityStateProvince sẽ là cityName
    // Nếu quốc gia có state, cityStateProvince đã được set là stateName.
    // Logic này giả định rằng nếu có states, người dùng chọn state trước, rồi mới có thể chọn city (nếu API hỗ trợ city theo state).
    // Hiện tại API countrystatecity lấy city theo country, không theo state.
    // Vậy nên khi chọn city, cityStateProvince nên là city.
    // Tuy nhiên, nếu đã chọn state, thì cityStateProvince nên giữ state, và city chỉ là thông tin phụ (nếu cần lưu riêng).
    // Theo cấu trúc hiện tại, cityStateProvince lưu hoặc state hoặc city.
    // Nếu có states, thì handleStateChange đã set cityStateProvince = stateName.
    // Nếu không có states, thì handleCityChange set cityStateProvince = cityName.
    // Điều này có vẻ hợp lý.
    onLocationChange('cityStateProvince', cityName);
  }, [onLocationChange]);

  // --- GIÁ TRỊ TRẢ VỀ ---
  const filteredCountries = internalSelectedContinent
    ? countries.filter(country => country.region === internalSelectedContinent)
    : [];

  return {
    states,
    cities,
    filteredCountries,
    internalSelectedContinent,
    internalSelectedCountry,
    internalSelectedState,
    internalSelectedCity,
    handleContinentChange,
    handleCountryChange,
    handleStateChange,
    handleCityChange,
  };
};