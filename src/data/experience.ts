export interface Experience {
  id: string;
  role: string;
  org: string;
  category: 'Data Work' | 'Teaching' | 'Community';
  startYear: number;
  startMonth?: number;
  endYear: number;
  endMonth?: number;
  description: string;
  type?: 'role' | 'highlight';  // 'role' = ongoing position, 'highlight' = project/achievement
}

export const experiences: Experience[] = [
  // Data Work
  {
    id: 'justlease',
    role: 'Marketing Intelligence',
    org: 'Justlease.nl',
    category: 'Data Work',
    startYear: 2017,
    endYear: 2018,
    description: 'Data analysis with Python and R, MS SQL database marketing, and internal Tableau champion.',
  },
  {
    id: 'biztory',
    role: 'Analytics Consultant',
    org: 'Biztory',
    category: 'Data Work',
    startYear: 2018,
    endYear: 2020,
    description: '30+ clients in 4 countries, covering the full analytics lifecycle from architecture to reporting.',
  },
  {
    id: 'xebia',
    role: 'Analytics Engineer',
    org: 'Xebia',
    category: 'Data Work',
    startYear: 2020,
    endYear: 2024,
    description: 'Analytics engineering, dbt, and data modeling for clients across the Netherlands.',
  },

  // Teaching
  {
    id: 'ta-groningen',
    role: 'Teaching Assistant',
    org: 'University of Groningen',
    category: 'Teaching',
    startYear: 2014,
    endYear: 2016,
    description: 'Taught 5 different courses, 548 hours across 192 students.',
  },
  {
    id: 'guest-lecturer',
    role: 'Guest Lecturer',
    org: 'University of Groningen',
    category: 'Teaching',
    startYear: 2021,
    endYear: 2022,
    description: 'Hands-on course covering each step of the data lifecycle for honours students.',
  },
  {
    id: 'nimbus-coach',
    role: 'Head Coach',
    org: 'Nimbus Intelligence',
    category: 'Teaching',
    startYear: 2025,
    endYear: 2025,
    description: 'Designed and delivered a 3-month data engineering bootcamp for new hires.',
  },
  {
    id: 'independent-instructor',
    role: 'Independent Instructor',
    org: 'Online Courses',
    category: 'Teaching',
    startYear: 2024,
    endYear: 2026,
    description: 'Building self-paced courses on SQL and analytics engineering.',
  },
  {
    id: 'zoomcamp',
    role: 'Zoomcamp Instructor',
    org: 'DataTalks.Club',
    category: 'Teaching',
    startYear: 2025,
    endYear: 2026,
    description: 'Analytics engineering module in the Data Engineering Zoomcamp.',
  },
  {
    id: 'dbt-labs',
    role: 'Technical Instructor',
    org: 'dbt Labs',
    category: 'Teaching',
    startYear: 2026,
    endYear: 2026,
    description: 'Live dbt Cloud training for data teams around the world.',
  },

  // Community
  {
    id: 'meetup',
    role: 'Organizer',
    org: 'Meetup',
    category: 'Community',
    startYear: 2016,
    endYear: 2026,
    description: 'Analytics Engineering, Dutch dbt, and Data Visualization meetups.',
    type: 'role',
  },
  {
    id: 'book-fundamentals',
    role: 'Co-Author',
    org: 'Fundamentals of Analytics Engineering',
    category: 'Community',
    startYear: 2023,
    startMonth: 2,
    endYear: 2024,
    endMonth: 3,
    description: 'Analytics engineering textbook published by Packt. Wrote prologue, conclusion, chapters on serving data and data governance, led project management, and created initial outline and technical documentation.',
    type: 'highlight',
  },
  {
    id: 'book-consultant-handbook',
    role: 'Co-Author',
    org: 'The Data Consultant\'s Handbook',
    category: 'Community',
    startYear: 2025,
    startMonth: 11,
    endYear: 2026,
    endMonth: 12,
    description: 'Forthcoming analytics consulting guide published by Packt. Currently in development.',
    type: 'highlight',
  },
  {
    id: 'podcast',
    role: 'Podcast Host',
    org: 'SQL Lingua Franca',
    category: 'Community',
    startYear: 2024,
    startMonth: 1,
    endYear: 2025,
    endMonth: 6,
    description: 'Conversations about data, analytics engineering, and the SQL ecosystem.',
    type: 'highlight',
  },
  {
    id: 'speaker',
    role: 'Conference Speaker',
    org: 'Dozens of talks',
    category: 'Community',
    startYear: 2016,
    endYear: 2026,
    description: 'dbt Coalesce, Linux Foundation, Big Data Summit, Developer Week LatAm.',
    type: 'role',
  },
  {
    id: 'dbt-award',
    role: 'Recipient',
    org: 'dbt Community Award',
    category: 'Community',
    startYear: 2024,
    startMonth: 11,
    endYear: 2024,
    endMonth: 11,
    description: 'Recognized by the global dbt community for contributions to analytics engineering.',
    type: 'highlight',
  },
  {
    id: 'dbt-excel',
    role: 'Creator',
    org: 'dbt Excel',
    category: 'Community',
    startYear: 2023,
    startMonth: 4,
    endYear: 2023,
    endMonth: 4,
    description: 'A fully working dbt adapter for Excel, built as an April Fools\' prank. Deprecated, as intended.',
    type: 'highlight',
  },
];
