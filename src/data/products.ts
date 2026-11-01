export type Product = {
  id: string;
  index: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  accent: 'blue' | 'green';
  features: string[];
  applications: string[];
  benefits?: string[];
  dashboard?: {label: string;url: string;};
};

export const products: Product[] = [
{
  id: 'smart-energy-meter',
  index: '01',
  name: 'Smart Energy Meter',
  tagline: 'Prepaid & postpaid metering with cloud analytics',
  description:
  'Advanced prepaid and postpaid smart energy metering system capable of real-time monitoring, energy analytics, remote management, and intelligent billing.',
  image: "/cc18d823-ddc2-4183-b2c8-9fa621cbd2e6.jpg",

  accent: 'blue',
  features: [
  'Real-time energy monitoring',
  'Remote meter reading',
  'GSM/WiFi communication',
  'Cloud dashboard',
  'Energy consumption analytics',
  'Token-based prepaid billing',
  'Remote disconnect/reconnect',
  'Alerts and notifications'],

  applications: [
  'Residential',
  'Commercial Buildings',
  'Industries',
  'Utilities',
  'Solar Installations'],

  dashboard: {
    label: 'Open Energy Management Dashboard',
    url: 'https://dashboard.motechenergyembedded.com/'
  }
},
{
  id: 'smart-breathalyzer',
  index: '02',
  name: 'Smart Breathalyzer System',
  tagline: 'Automated alcohol screening and access control',
  description:
  'An intelligent alcohol detection platform designed for organizations requiring automated access control and alcohol monitoring.',
  image: "/2c1182fb-6ff5-4259-932b-9e10ae936392.jpg",

  accent: 'green',
  features: [
  'Fast alcohol detection',
  'Cloud reporting',
  'Attendance integration',
  'User authentication',
  'Real-time alerts',
  'Data logging',
  'Multi-user support'],

  applications: [
  'Schools',
  'Factories',
  'Construction Sites',
  'Offices',
  'Hospitals',
  'Voting Centers',
  'Security Installations']

},
{
  id: 'data-logger',
  index: '03',
  name: 'Smart 1-Phase & 3-Phase Data Logger',
  tagline: 'Industrial power quality monitoring',
  description:
  'Professional industrial power quality monitoring system designed for solar plants, commercial buildings, manufacturing industries, and utilities.',
  image: "/f47c1d97-5f3e-43ef-9850-d97c5f78bb18.jpg",

  accent: 'blue',
  features: [
  'Voltage monitoring',
  'Current monitoring',
  'Frequency analysis',
  'Harmonics',
  'Power factor',
  'Energy logging',
  'Power quality reports',
  'Remote dashboard',
  'Solar plant monitoring',
  'Data export'],

  applications: [
  'Solar Farms',
  'Commercial Buildings',
  'Manufacturing Plants',
  'Utilities',
  'Data Centers',
  'Hospitals'],

  benefits: [
  'Correct solar sizing',
  'Power quality analysis',
  'Equipment protection',
  'Predictive maintenance']

},
{
  id: 'roamfi',
  index: '04',
  name: 'ROAMfi',
  tagline: 'Your home internet, securely, anywhere',
  description:
  'ROAMfi is an intelligent network-powered device that securely extends your home or office internet connection anywhere in the world. Using your existing ISP connection and home router, ROAMfi creates a secure private network tunnel, allowing remote users to access their home internet from virtually any location.',
  image: "/400d97a6-55ff-40b7-8a7c-a269dc2d75c2.jpg",

  accent: 'green',
  features: [
  'Secure encrypted connection',
  'Remote access to home network',
  'ISP-independent deployment',
  'Plug-and-play installation',
  'Low latency',
  'Private network tunneling',
  'Multiple device support',
  'Industrial-grade reliability'],

  applications: [
  'Remote Work',
  'Travelers',
  'Digital Nomads',
  'Businesses',
  'Remote Offices',
  'Home Networks',
  'Secure Internet Access'],

  benefits: [
  'Access your home internet anywhere',
  'Secure private networking',
  'Enhanced online privacy',
  'Seamless connectivity',
  'Easy deployment']

}];