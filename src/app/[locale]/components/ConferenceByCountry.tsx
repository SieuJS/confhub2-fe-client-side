import React from 'react';

const continentsData = [
  {
    name: 'Asia',
    flag: '🇦🇨', // Could be considered as symbolic for Asia
    countries: [
      'Afghanistan', 'Armenia', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia', 'China',
      'Cyprus', 'East Timor', 'Egypt', 'Georgia', 'India', 'Indonesia', 'Iran', 'Iraq', 'Israel', 'Japan', 'Jordan',
      'Kazakhstan', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Malaysia', 'Maldives', 'Mongolia', 'Myanmar (Burma)',
      'Nepal', 'North Korea', 'Oman', 'Pakistan', 'Palestine', 'Philippines', 'Qatar', 'Russia', 'Saudi Arabia',
      'Singapore', 'South Korea', 'Sri Lanka', 'Syria', 'Taiwan', 'Tajikistan', 'Thailand', 'Turkey', 'Turkmenistan',
      'United Arab Emirates (UAE)', 'Uzbekistan', 'Vietnam', 'Yemen', 'Hong Kong', 'Macau' // Special administrative regions
    ],
  },
  {
    name: 'Africa',
    flag: '🇬🇦', // Could be considered as symbolic for Africa
    countries: [
      'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cameroon', 'Central African Republic',
      'Chad', 'Comoros', 'Congo, Democratic Republic of the', 'Congo, Republic of the', 'Côte d\'Ivoire', 'Djibouti', 'Egypt',
      'Equatorial Guinea', 'Eritrea', 'Eswatini (Swaziland)', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau',
      'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique',
      'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia',
      'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe',
    ],
  },
  {
    name: 'Europe',
    flag: '🇪🇺', // European Union flag as symbolic for Europe
    countries: [
      'Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Cyprus',
      'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland',
      'Italy', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 'Monaco', 'Montenegro',
      'Netherlands', 'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia',
      'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom (UK)', 'Vatican City',
    ],
  },
  {
    name: 'North America',
    flag: '🇺🇸', // USA flag as symbolic for North America (can be debated, but for visual representation)
    countries: [
      'Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Canada', 'Costa Rica', 'Cuba', 'Dominica', 'Dominican Republic',
      'El Salvador', 'Grenada', 'Guatemala', 'Haiti', 'Honduras', 'Jamaica', 'Mexico', 'Nicaragua', 'Panama', 'Saint Kitts and Nevis',
      'Saint Lucia', 'Saint Vincent and the Grenadines', 'Trinidad and Tobago', 'United States of America (USA)',
      'Greenland', // Territory of Denmark
      'Bermuda', // British Overseas Territory
      'Cayman Islands', // British Overseas Territory
      'Turks and Caicos Islands', // British Overseas Territory
      'British Virgin Islands', // British Overseas Territory
      'US Virgin Islands', // US Territory
      'Puerto Rico', // US Territory
      'Aruba', // Constituent country of the Kingdom of the Netherlands
      'Curaçao', // Constituent country of the Kingdom of the Netherlands
      'Sint Maarten', // Constituent country of the Kingdom of the Netherlands
      'Anguilla', // British Overseas Territory
      'Montserrat', // British Overseas Territory
      'Guadeloupe', // French Overseas Department
      'Martinique', // French Overseas Department
      'Saint Barthélemy', // French Overseas Collectivity
      'Saint Martin', // French Overseas Collectivity
      'Saint Pierre and Miquelon', // French Overseas Collectivity
    ],
  },
  {
    name: 'Oceania',
    flag: '🇦🇺', // Australian flag as symbolic for Oceania (can be debated)
    countries: [
      'Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Micronesia, Federated States of', 'Nauru', 'New Zealand',
      'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu',
      'French Polynesia', // French Overseas Collectivity
      'New Caledonia', // French Overseas Collectivity
      'Wallis and Futuna', // French Overseas Collectivity
      'American Samoa', // US Territory
      'Guam', // US Territory
      'Northern Mariana Islands', // US Territory
      'Cook Islands', // Self-governing in free association with New Zealand
      'Niue', // Self-governing in free association with New Zealand
      'Tokelau', // Territory of New Zealand
    ],
  },
  {
    name: 'South America',
    flag: '🇦🇷', // Argentinian flag as symbolic for South America (can be debated)
    countries: [
      'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Paraguay', 'Peru', 'Suriname', 'Uruguay', 'Venezuela',
      'French Guiana', // French Overseas Department
      'Falkland Islands (Malvinas)', // British Overseas Territory, sovereignty disputed by Argentina
      'South Georgia and the South Sandwich Islands', // British Overseas Territory
    ],
  },
];

const ConferenceByCountry: React.FC = () => {
  return (
    <div className="bg-background min-h-screen  py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center mb-8">Conference by Country</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {continentsData.map((continent, index) => (
            <div key={index} className="bg-gradient-to-r from-background to-background-secondary rounded-lg shadow-md overflow-hidden ">
            <div className="px-6 py-4 border-b flex items-center space-x-2">
              <span className="text-xl">{continent.flag}</span>
              <h2 className="text-lg font-semibold">{continent.name}</h2>
            </div>
            <div className="px-6 py-4">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-background-secondary scrollbar-track-background ">
                {continent.countries.map((country, countryIndex) => (
                  <li key={countryIndex} className="flex items-center space-x-1">
                    <span className=" mr-1"></span>
                    <span>{country}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConferenceByCountry;