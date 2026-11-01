import type { ProtectedFile, StoreProduct } from '../types/store';

export const bankDetails = {
  bank: 'I&M Bank Kenya Ltd',
  accountName: 'MOTECH Embedded Engineering Ltd',
  accountNumber: '04005318956150',
  currency: 'KES',
  branchNote: 'Quote your Payment Reference on the deposit slip / transfer narrative.'
};

export const catalog: StoreProduct[] = [
{
  id: 'prd-sem-100',
  slug: 'smart-energy-meter-sem-100',
  name: 'Smart Energy Meter SEM-100',
  category: 'Smart Energy Hardware',
  summary:
  'Single-phase prepaid/postpaid smart meter with GSM backhaul and cloud analytics.',
  description:
  'The SEM-100 is a production-grade single-phase smart energy meter supporting prepaid token vending and postpaid billing. It streams load, voltage and tamper telemetry to the MOTECH cloud, and supports remote disconnect/reconnect from the Energy Management Dashboard.',
  image: "/cc18d823-ddc2-4183-b2c8-9fa621cbd2e6.jpg",

  price: 18500,
  currency: 'KES',
  status: 'available',
  features: [
  'Class 1 active energy accuracy',
  'Token-based prepaid vending',
  'Remote disconnect / reconnect relay',
  'Tamper, reverse-flow and magnetic detection',
  'Over-the-air firmware updates',
  'Cloud dashboard provisioning'],

  applications: [
  'Residential landlords',
  'Commercial buildings',
  'Utility rollouts',
  'Solar hybrid installations'],

  specs: [
  { label: 'Rated voltage', value: '240 V AC ±20%' },
  { label: 'Rated current', value: '5(80) A direct connect' },
  { label: 'Accuracy class', value: 'Class 1 (IEC 62053-21)' },
  { label: 'Metering interval', value: '1 s sampling / 15 min logging' },
  { label: 'Enclosure', value: 'IP54 polycarbonate, sealed terminal cover' }],

  hardware: [
  { label: 'MCU', value: 'ARM Cortex-M4 @ 120 MHz' },
  { label: 'Metrology', value: 'Dedicated AFE with shunt + CT input' },
  { label: 'Modem', value: 'LTE Cat-M1 / 2G fallback, WiFi option' },
  { label: 'Memory', value: '512 KB flash logging, EEPROM billing registers' },
  { label: 'Display', value: 'Backlit segment LCD + keypad' }],

  software: [
  { label: 'Firmware', value: 'FreeRTOS, secure boot, signed OTA images' },
  { label: 'Protocols', value: 'MQTT/TLS 1.2, DLMS/COSEM profile' },
  { label: 'Cloud', value: 'MOTECH Energy Management Dashboard' },
  { label: 'APIs', value: 'REST vending + telemetry endpoints' }],

  architecture: [
  'Metrology AFE samples voltage and current continuously and computes energy registers.',
  'MCU firmware maintains billing registers, tariff logic and tamper events in non-volatile memory.',
  'LTE Cat-M1 modem publishes telemetry over MQTT/TLS to the MOTECH ingestion gateway.',
  'Dashboard services expose vending, analytics and remote-control commands to operators.']

},
{
  id: 'prd-brz-200',
  slug: 'smart-breathalyzer-brz-200',
  name: 'Smart Breathalyzer BRZ-200',
  category: 'Safety & Access Control',
  summary:
  'Wall-mounted alcohol screening terminal with cloud reporting and attendance integration.',
  description:
  'The BRZ-200 automates workforce alcohol screening at site entry. Each test is bound to an authenticated user, logged to the cloud and optionally gated against the attendance or access-control system.',
  image: "/2c1182fb-6ff5-4259-932b-9e10ae936392.jpg",

  price: 96000,
  currency: 'KES',
  status: 'available',
  features: [
  'Sub-5 second screening cycle',
  'Fingerprint and RFID authentication',
  'Automatic pass/fail gate signalling',
  'Cloud reporting and CSV export',
  'Real-time supervisor alerts',
  'Tamper-evident audit log'],

  applications: [
  'Factories and plants',
  'Construction sites',
  'Schools and institutions',
  'Hospitals',
  'Security installations'],

  specs: [
  { label: 'Sensor', value: 'Electrochemical fuel-cell cell' },
  { label: 'Range', value: '0.000 – 0.400 % BAC' },
  { label: 'Accuracy', value: '±0.005 % BAC at 0.100 %' },
  { label: 'Cycle time', value: '< 5 s test, 8 s recovery' },
  { label: 'Power', value: '12 V DC PSU, battery backup' }],

  hardware: [
  { label: 'MCU', value: 'ARM Cortex-M7 @ 216 MHz' },
  { label: 'Display', value: '5" capacitive touch, 800×480' },
  { label: 'Identity', value: 'Optical fingerprint + 13.56 MHz RFID' },
  { label: 'I/O', value: '2× relay outputs for turnstile / door strike' }],

  software: [
  { label: 'Firmware', value: 'RTOS with encrypted local result store' },
  { label: 'Connectivity', value: 'Ethernet / WiFi, MQTT over TLS' },
  { label: 'Integrations', value: 'Attendance and HR webhook connectors' },
  { label: 'Reporting', value: 'Web console, scheduled PDF/CSV reports' }],

  architecture: [
  'Fuel-cell sensor result is captured and immediately bound to the authenticated operator identity.',
  'Firmware writes an encrypted local record, then signals the gate relay per configured threshold.',
  'Records sync to the cloud reporting service over MQTT/TLS with store-and-forward on outage.',
  'Supervisors receive alerts and pull audit reports from the web console.']

},
{
  id: 'prd-pql-300',
  slug: 'power-quality-data-logger-pql-300',
  name: 'Power Quality Data Logger PQL-300',
  category: 'Power Quality Instrumentation',
  summary:
  '1-phase & 3-phase power quality analyser for solar plants, industry and utilities.',
  description:
  'The PQL-300 captures voltage, current, frequency, harmonics and power factor at instrument grade, producing power quality reports used for solar sizing, equipment protection and predictive maintenance.',
  image: "/f47c1d97-5f3e-43ef-9850-d97c5f78bb18.jpg",

  price: 245000,
  currency: 'KES',
  status: 'available',
  features: [
  'True-RMS 3-phase + neutral measurement',
  'Harmonics to the 50th order',
  'Sag, swell and transient capture',
  'Power factor and demand logging',
  'Remote dashboard and data export',
  'Solar plant yield monitoring'],

  applications: [
  'Solar farms',
  'Manufacturing plants',
  'Utilities and substations',
  'Data centres',
  'Hospitals'],

  specs: [
  { label: 'Channels', value: '4× voltage, 4× current (CT clamp)' },
  { label: 'Sampling', value: '15.36 kHz per channel' },
  { label: 'Harmonics', value: 'THD + individual to H50' },
  { label: 'Logging', value: 'Configurable 1 s – 30 min intervals' },
  { label: 'Mounting', value: 'DIN rail, IP20 enclosure' }],

  hardware: [
  { label: 'ADC', value: '24-bit simultaneous-sampling front end' },
  { label: 'CT inputs', value: 'Rogowski or split-core, 5 A / 1 V' },
  { label: 'Storage', value: '32 GB industrial eMMC ring buffer' },
  { label: 'Interfaces', value: 'RS-485 Modbus, Ethernet, USB-C' }],

  software: [
  { label: 'Firmware', value: 'Linux-based logger with watchdog supervision' },
  { label: 'Protocols', value: 'Modbus TCP/RTU, MQTT, IEC 61000 reporting' },
  { label: 'Analysis', value: 'Web dashboard with waveform playback' },
  { label: 'Export', value: 'CSV, PQDIF-compatible, scheduled PDF reports' }],

  architecture: [
  'Simultaneous-sampling ADC front end digitises all voltage and current channels.',
  'On-device DSP computes RMS, harmonics, flicker and event captures per IEC methods.',
  'Records land in an industrial eMMC ring buffer, then replicate to the analysis service.',
  'Engineers review waveforms, compliance summaries and export audit-ready reports.']

},
{
  id: 'prd-rmf-400',
  slug: 'roamfi-secure-network-node',
  name: 'ROAMfi Secure Network Node',
  category: 'Network Technologies',
  summary:
  'Private tunnelling node that securely extends your home or office internet anywhere.',
  description:
  'ROAMfi pairs with your existing router to create an encrypted private tunnel, letting remote users reach their home or office network — and browse through their own ISP connection — from anywhere.',
  image: "/400d97a6-55ff-40b7-8a7c-a269dc2d75c2.jpg",

  price: 34500,
  currency: 'KES',
  status: 'available',
  features: [
  'WireGuard-class encrypted tunnel',
  'ISP-independent deployment',
  'Plug-and-play pairing',
  'Multiple client devices',
  'Low-latency routing',
  'Industrial-grade thermal design'],

  applications: [
  'Remote work',
  'Travelling professionals',
  'Remote offices',
  'Secure internet access'],

  specs: [
  { label: 'Throughput', value: 'Up to 240 Mbps tunnelled' },
  { label: 'Clients', value: 'Up to 16 concurrent devices' },
  { label: 'Ports', value: '2× Gigabit Ethernet' },
  { label: 'Power', value: 'USB-C PD, 9 W typical' }],

  hardware: [
  { label: 'SoC', value: 'Quad-core ARM Cortex-A55 @ 1.6 GHz' },
  { label: 'Crypto', value: 'Hardware AES/ChaCha acceleration' },
  { label: 'Memory', value: '1 GB LPDDR4, 8 GB eMMC' },
  { label: 'Wireless', value: 'WiFi 6 dual-band AP + client' }],

  software: [
  { label: 'OS', value: 'Hardened Linux with verified boot' },
  { label: 'Tunnel', value: 'WireGuard-compatible key exchange' },
  { label: 'Management', value: 'Local web UI + mobile pairing app' },
  { label: 'Updates', value: 'Signed A/B OTA images' }],

  architecture: [
  'Home node registers with the rendezvous service using a device-bound key pair.',
  'Remote client authenticates and negotiates a direct encrypted tunnel where possible.',
  'Traffic egresses via the home ISP connection, preserving the user’s home network context.',
  'Local web UI and mobile app manage peers, keys and firmware updates.']

},
{
  id: 'prd-doc-sem',
  slug: 'smart-metering-engineering-package',
  name: 'Smart Metering Engineering Package',
  category: 'Digital Engineering Package',
  summary:
  'Complete design pack: schematics, PCB, firmware source and commissioning manuals.',
  description:
  'A licensed engineering package for teams building or maintaining smart metering deployments. Includes full hardware design files, firmware source, integration specifications and commissioning procedures.',
  image: "/cc18d823-ddc2-4183-b2c8-9fa621cbd2e6.jpg",

  price: 125000,
  currency: 'KES',
  status: 'available',
  features: [
  'Full schematic and PCB source',
  'Firmware source with build instructions',
  'Metrology calibration procedure',
  'Cloud integration specification',
  'Commissioning and QA checklists',
  'Single-organisation licence'],

  applications: [
  'Utility engineering teams',
  'OEM integrators',
  'Research institutions',
  'Consulting engineers'],

  specs: [
  { label: 'Deliverable', value: 'Digital download package' },
  { label: 'Licence', value: 'Single organisation, perpetual' },
  { label: 'Revisions', value: '12 months of update access' },
  { label: 'Support', value: 'Email engineering support included' }],

  hardware: [
  { label: 'Reference design', value: 'SEM-100 rev C, 4-layer PCB' },
  { label: 'BOM', value: 'Fully sourced with alternates' },
  { label: 'Test fixture', value: 'Calibration jig drawings included' }],

  software: [
  { label: 'Firmware', value: 'C / FreeRTOS source tree' },
  { label: 'Toolchain', value: 'GCC ARM, documented build scripts' },
  { label: 'Cloud spec', value: 'MQTT topic + payload schema reference' }],

  architecture: [
  'Hardware design set: schematic, layout, fabrication and assembly drawings.',
  'Firmware source tree with documented build and flashing procedure.',
  'Integration specification describing telemetry schema and vending APIs.',
  'Commissioning package covering calibration, QA and field acceptance.']

},
{
  id: 'prd-doc-pq',
  slug: 'power-quality-audit-toolkit',
  name: 'Power Quality Audit Toolkit',
  category: 'Digital Engineering Package',
  summary:
  'Audit methodology, report templates and analysis software for power quality studies.',
  description:
  'Everything an engineering team needs to run a bankable power quality audit: measurement methodology, compliance thresholds, analysis tooling and client-ready report templates.',
  image: "/f47c1d97-5f3e-43ef-9850-d97c5f78bb18.jpg",

  price: 68000,
  currency: 'KES',
  status: 'preorder',
  features: [
  'IEC-aligned audit methodology',
  'Analysis scripts and templates',
  'Solar sizing worksheets',
  'Client report templates',
  'Threshold and compliance matrices'],

  applications: [
  'Consulting engineers',
  'Solar EPCs',
  'Facility managers',
  'Utility planning teams'],

  specs: [
  { label: 'Deliverable', value: 'Digital download package' },
  { label: 'Licence', value: 'Per-engineer seat, perpetual' },
  { label: 'Availability', value: 'Pre-order — released on verification' }],

  hardware: [
  { label: 'Compatible instrument', value: 'PQL-300 and generic PQ loggers' },
  { label: 'Field kit list', value: 'Recommended CT and safety equipment' }],

  software: [
  { label: 'Analysis', value: 'Python notebooks for harmonic + event analysis' },
  { label: 'Templates', value: 'Report templates in DOCX and XLSX' },
  { label: 'Data', value: 'CSV / PQDIF ingest helpers' }],

  architecture: [
  'Define measurement plan and instrument placement per audit objective.',
  'Ingest logger exports into the analysis notebooks.',
  'Evaluate against compliance thresholds and generate findings.',
  'Produce the client-facing report from the supplied templates.']

}];


/** Protected resources. Storage locations are deliberately not represented. */
export const protectedFiles: ProtectedFile[] = [
{
  id: 'f-sem-manual',
  productId: 'prd-sem-100',
  title: 'SEM-100 Technical & Installation Manual',
  category: 'Technical Manual',
  format: 'PDF',
  sizeLabel: '8.4 MB',
  version: 'v3.2',
  uploadedAt: '2026-05-14'
},
{
  id: 'f-sem-fw',
  productId: 'prd-sem-100',
  title: 'SEM-100 Signed Firmware Image',
  category: 'Firmware',
  format: 'BIN + SIG',
  sizeLabel: '1.1 MB',
  version: 'v3.2.7',
  uploadedAt: '2026-06-02'
},
{
  id: 'f-sem-commission',
  productId: 'prd-sem-100',
  title: 'SEM-100 Commissioning Checklist',
  category: 'Commissioning',
  format: 'PDF',
  sizeLabel: '640 KB',
  version: 'v1.4',
  uploadedAt: '2026-04-08'
},
{
  id: 'f-brz-manual',
  productId: 'prd-brz-200',
  title: 'BRZ-200 Operation & Calibration Manual',
  category: 'Technical Manual',
  format: 'PDF',
  sizeLabel: '6.2 MB',
  version: 'v2.1',
  uploadedAt: '2026-03-27'
},
{
  id: 'f-brz-sw',
  productId: 'prd-brz-200',
  title: 'BRZ-200 Reporting Console Installer',
  category: 'Software',
  format: 'ZIP',
  sizeLabel: '54 MB',
  version: 'v2.0.3',
  uploadedAt: '2026-05-30'
},
{
  id: 'f-pql-manual',
  productId: 'prd-pql-300',
  title: 'PQL-300 Instrument Manual',
  category: 'Technical Manual',
  format: 'PDF',
  sizeLabel: '11.7 MB',
  version: 'v4.0',
  uploadedAt: '2026-06-11'
},
{
  id: 'f-pql-report',
  productId: 'prd-pql-300',
  title: 'PQL-300 Power Quality Report Templates',
  category: 'Software',
  format: 'ZIP',
  sizeLabel: '3.9 MB',
  version: 'v1.8',
  uploadedAt: '2026-02-19'
},
{
  id: 'f-rmf-manual',
  productId: 'prd-rmf-400',
  title: 'ROAMfi Deployment Guide',
  category: 'Technical Manual',
  format: 'PDF',
  sizeLabel: '4.5 MB',
  version: 'v1.6',
  uploadedAt: '2026-06-20'
},
{
  id: 'f-rmf-fw',
  productId: 'prd-rmf-400',
  title: 'ROAMfi Signed OS Image',
  category: 'Firmware',
  format: 'IMG + SIG',
  sizeLabel: '186 MB',
  version: 'v1.6.2',
  uploadedAt: '2026-07-01'
},
{
  id: 'f-doc-sem-sch',
  productId: 'prd-doc-sem',
  title: 'SEM-100 Schematics & PCB Source',
  category: 'Schematics & PCB',
  format: 'ZIP',
  sizeLabel: '92 MB',
  version: 'rev C',
  uploadedAt: '2026-05-02'
},
{
  id: 'f-doc-sem-src',
  productId: 'prd-doc-sem',
  title: 'SEM-100 Firmware Source Tree',
  category: 'Design Package',
  format: 'TAR.GZ',
  sizeLabel: '28 MB',
  version: 'v3.2.7',
  uploadedAt: '2026-06-02'
},
{
  id: 'f-doc-pq-kit',
  productId: 'prd-doc-pq',
  title: 'Power Quality Audit Toolkit Bundle',
  category: 'Design Package',
  format: 'ZIP',
  sizeLabel: '46 MB',
  version: 'v1.0',
  uploadedAt: '2026-07-08'
}];