"use client" 
import React from 'react';

const ConferenceByTopic: React.FC = () => {
  type TopicData = {
    [key: string]: string[];
  };

  const topicData: TopicData = {
    'Business And Economics': [
      'Accounting',
      'Banking',
      'Banking and Finance',
      'Business',
      'Business Ethics',
      'E-commerce',
      'Economics',
      'Entrepreneurship',
      'Finance',
      'Human Resources',
      'Insurance',
      'Logistics',
      'Management',
      'Marketing',
      'Micromanagement',
      'Real Estate',
      'Supply Chain',
    ],
    Education: [
      'Distance Education',
      'E-learning',
      'Education Innovation',
      'Higher Education',
      'Innovation',
      'Lifelong Learning',
      'Teacher',
      'Teaching',
      'Teaching and Learning',
      'Vocational education',
    ],
    'Engineering': [
      'Aeronautical',
      'Architecture',
      'Artificial Intelligence',
      'Big Data',
      'Bioinformatic',
      'Biomedical Engineering',
      'Biotechnology',
      'Computer Software And Applications',
      'Computer Vision',
      'Computing',
      'Construction',
      'Cybersecurity',
      'Data Mining',
      'Information Technology',
      'Internet And World Wide Web',
      'Knowledge Management',
      'Manufacturing',
      'Materials',
      'Military',
      'Mining',
      'Nanoscience',
      'Nanotechnology',
      'Nanotechnology And Smart Materials',
      'Networking',
      'Polymers And Plastics',
      'Remote Sensing',
    ],
    'Engineering And Technology': [
      'Aerospace',
      'Biotechnology',
      'Civil Engineering',
      'Computer Science Engineering',
      'Computer Software and Applications',
      'Electrical and Electronics Engineering',
      'Electronics and Communication Engineering',
      'Engineering Chemistry',
      'Industrial Engineering',
      'Information Technology',
      'Life Science Engineering',
      'Marine Engineering',
      'Mechanical Engineering',
      'Paint Technology',
      'Procurement',
      'Security',
      'Software Engineering',
      'Space Law',
      'Vision Engineering',
    ],
    'Health And Medicine': [
      'Acupuncture',
      'Alternative Health',
      'Anesthesia',
      'Applied psychology',
      'Biophysics',
      'Cancer Nursing',
      'Cardiology',
      'Cosmetology',
      'Critical Care',
      'Clinical Laboratory',
      'Dentistry',
      'Dermatology',
      'Diabetes',
      'Disability',
      'Disability and Rehabilitation',
      'Epidemiology',
      'Family Medicine',
      'Food Nutrition',
      'Food Safety',
      'Food Waste',
      'Gastroenterology',
      'Gerontology',
      'Gynecology',
      'Health',
      'Healthcare',
      'Hematology',
      'HIV',
      'Immunology',
      'Immunometabolism',
      'Infectious Diseases',
      'Laboratory Medicine',
      'Medical',
      'Medical Ethics',
      'Medicine and Medical Science',
      'Mental Health',
      'Metabolism',
      'Microbiology',
      'Medicinal Chemistry',
      'Neurology',
      'Neuroscience',
      'Nephrology',
      'Nursing',
      'Nutrition',
      'Nutrition and Dietetics',
      'Obesity',
      'Obstetrics',
      'Oncology',
      'Organoid',
      'Ophthalmology',
      'Orthodontic',
      'Orthopedic',
      'Otolaryngology',
      'Palliative Care',
      'Pathology',
      'Pediatric',
      'Pediatric Cardiology',
      'Pediatric Dentistry',
      'Pharmacy',
      'Psychiatry',
      'Psychology',
      'Physiotherapy',
      'Public Health',
      'Radiology',
      'Rheumatology',
      'Surgery',
      'Surgical',
      'Urology',
      'Ultrasound',
      'Vaccines',
    ],
    Interdisciplinary: [
      'Children and Youth',
      'Church',
      'Catholic Church',
      'Christian',
      'Communications and Media',
      'Complex Systems',
      'Conflict Resolution',
      'Creativity',
      'Culture',
      'Discourse',
      'Disaster Management',
      'Domestic Violence',
      'Fashion Design',
      'Film Studies',
      'Gender Studies',
      'GLBT Studies',
      'Globalization',
      'HIV/AIDS',
      'Hospitality',
      'Human Rights',
      'Identity',
      'Leadership',
      'Memory',
      'Poverty',
      'Public Policy',
      'Psychology',
      'Sexuality and Eroticism',
      'Spirituality',
      'Sport Science',
      'Tourism',
      'Urban Studies',
      'Violence',
    ],
    'Mathematics And Statistics': [
      'Applied Mathematics',
      'Blockchain',
      'Computational Science',
      'Cryptography',
      'Mathematics',
      'Statistics',
    ],
    'Physical And Life Sciences': [
      'Agriculture',
      'Agritourism',
      'Animal',
      'Animal Genetics',
      'Aquaculture',
      'Archaeology',
      'Astronomy',
      'Biodiversity',
      'Biology',
      'Chemistry',
      'Climatology',
      'Discourse',
      'Diabetes',
      'Earth Sciences',
      'Ecology',
      'Environment',
      'Environmental Sustainability',
      'Fisheries',
      'Forensic',
      'Genetics',
      'GIS',
      'Hydrology',
      'Hydrogen',
      'Life Science',
      'Meteorology',
      'Microplastics',
      'Oceanography',
      'Physics',
      'Soil',
      'Sustainability',
      'Sustainable Development',
      'Theoretical Chemistry',
      'Urban Planning',
      'Veterinary',
      'Water',
      'Waste Management',
      'Yeast',
    ],
    'Regional Studies': ['African Studies', 'American Studies', 'Asian Studies', 'European Studies'],
    'Social Science And Humanities': [
      'Anthropology',
      'Aesthetics',
      'Art History',
      'Arts',
      'Buddhism',
      'English',
      'English Literature',
      'Ethnography',
      'Geography',
      'History',
      'Information Science',
      'Interdisciplinary Studies',
      'Islamic Studies',
      'Language',
      'Linguistics',
      'Literature',
      'Literacy',
      'Local Government',
      'Multidisciplinary Studies',
      'Museums and Heritage',
      'Music',
      'Migration',
      'Occupational Science',
      'Philosophy',
      'Physical Education',
      'Poetry',
      'Politics',
      'Religious Studies',
      'Social',
      'Sociolinguistics',
      'Sociology',
      'Social Sciences',
      'Social Work',
      'Soil',
      'Translation',
    ],
    Law: ['Intellectual Property', 'Law'],
  };

  const categories = Object.keys(topicData);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('Engineering'); // Default to Engineering

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="antialiased bg-backround">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6 text-center">Conference By Topics</h1>
        <div className="flex">
          {/* Left Navigation */}
          <div className="w-1/4 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-md overflow-hidden">
            {categories.map((category, index) => (
              <div
                key={index}
                onClick={() => handleCategoryClick(category)}
                className={`px-6 py-3 cursor-pointer hover:bg-button-text ${
                  category === selectedCategory ? 'bg-span-bg text-button-text font-semibold' : ''
                }`}
              >
                {category}
              </div>
            ))}
          </div>

          {/* Right Content */}
          <div className="w-3/4 bg-gradient-to-r from-background to-background-secondary shadow-md rounded-md ml-6">
            <div className="bg-span-bg text-button-text rounded-t-md py-3 px-6 mb-4">
              <h2 className="font-semibold">{selectedCategory}</h2>
            </div>
            <div className="flex px-6">
              <div className="w-1/2 pr-4">
                <ul>
                  {topicData[selectedCategory]
                    ?.slice(0, Math.ceil(topicData[selectedCategory].length / 2)) // Dynamically split subtopics
                    .map((topic, index) => (
                      <li key={index} className="py-1 list-inside">
                        {topic}
                      </li>
                    ))}
                </ul>
              </div>
              <div className="w-1/2">
                <ul>
                  {topicData[selectedCategory]
                    ?.slice(Math.ceil(topicData[selectedCategory].length / 2)) // Dynamically split subtopics
                    .map((topic, index) => (
                      <li key={index} className="py-1 list-inside">
                        {topic}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConferenceByTopic;