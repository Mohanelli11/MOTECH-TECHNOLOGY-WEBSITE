# MOTECH Embedded Engineering Ltd Website

> **Engineering Intelligence. Powering Tomorrow.**

Official website for **MOTECH Embedded Engineering Ltd**, an engineering and technology company focused on developing intelligent embedded systems, smart energy solutions, IoT technologies, power quality monitoring systems, data analytics, and intelligent connectivity solutions.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.4-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.2.0-646cff)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-38b2ac)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/Mohanelli11/MOTECH-TECHNOLOGY-WEBSITE.git
cd MOTECH-TECHNOLOGY-WEBSITE

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

---

## 📋 About MOTECH

MOTECH Embedded Engineering Ltd develops practical engineering technologies designed to solve real-world challenges across energy, industrial automation, safety, connectivity, and data management.

Our solutions combine **embedded hardware, intelligent monitoring, cloud platforms, data analytics, and engineering expertise** to create reliable and scalable technology products.

### Core Areas

* ⚡ Smart Energy
* 🔌 Embedded Engineering
* 📡 IoT & Connected Systems
* 📊 Data Analytics
* ⚙️ Power Quality Monitoring
* 🌐 Network Connectivity
* 🏭 Industrial Monitoring
* 💡 Engineering Solutions

---

## 🛠️ Products

### 1. Smart Energy Meters

MOTECH Smart Energy Meters provide intelligent monitoring and management of electrical energy consumption.

#### Key Capabilities

* Real-time energy monitoring
* Remote meter reading
* Smart energy management
* Energy consumption analytics
* Prepaid energy management
* Token-based billing
* Remote disconnect/reconnect
* Alerts and notifications
* Cloud-based monitoring

#### Energy Management Dashboard

Users can access the online Energy Management System through:

**[Open Energy Management Dashboard](https://dashboard.motechenergyembedded.com/)**

---

### 2. Smart Breathalyzers

MOTECH Smart Breathalyzer systems provide intelligent alcohol-content monitoring for organizations and institutions.

The system can be used to monitor alcohol consumption and support safety, compliance, and access-control processes.

#### Applications

* Schools
* Organizations
* Factories
* Construction sites
* Offices
* Hospitals
* Voting centers
* Security installations

#### Key Capabilities

* Alcohol-content detection
* User identification
* Data logging
* Real-time monitoring
* Alerts
* Centralized reporting
* Cloud-based data management

---

### 3. Smart 1-Phase & 3-Phase Data Loggers

MOTECH Smart Data Loggers are designed for **power quality monitoring, energy analysis, solar assessment, and electrical system diagnostics**.

They can be deployed in solar plants, industrial facilities, commercial buildings, and other electrical installations.

#### Monitoring Capabilities

* Voltage
* Current
* Frequency
* Power factor
* Active power
* Reactive power
* Apparent power
* Energy consumption
* Power quality parameters
* Harmonic analysis
* Long-term electrical data logging

#### Applications

* Solar plants
* Solar system assessment
* Industrial facilities
* Commercial buildings
* Manufacturing plants
* Utilities
* Data centers
* Electrical system audits

#### Key Benefit

The collected electrical data can help engineers make informed decisions when performing **solar sizing, power-quality assessments, system audits, equipment analysis, and energy studies**.

---

### 4. ROAMfi

**ROAMfi** is a network-powered connectivity device designed to allow users to access their home or office internet connection remotely.

The concept enables a user to connect to their existing ISP/home-router network from virtually anywhere in the world through a secure network connection.

#### Key Features

* Remote access to home network
* Secure network connectivity
* Encrypted communication
* Plug-and-play deployment
* Remote internet access
* Multiple-device support
* Home/office network connectivity
* ISP-based deployment

#### Applications

* Remote work
* Travel
* Digital nomads
* Remote offices
* Home networks
* Businesses
* Secure remote connectivity

ROAMfi is being developed as part of MOTECH's broader vision for **intelligent, secure, and accessible network infrastructure**.

---

## 🎯 Our Mission

To engineer intelligent technologies that improve **efficiency, safety, connectivity, energy management, and decision-making** for individuals, organizations, and industries.

## 🌍 Our Vision

To become a leading African engineering technology company delivering innovative embedded, energy, IoT, monitoring, and connectivity solutions for a smarter and more connected future.

---

## 💡 Why MOTECH?

### Innovation

We transform engineering challenges into practical technology solutions.

### Intelligent Systems

Our products combine hardware, software, connectivity, and data to provide actionable intelligence.

### Engineering Excellence

We apply electrical, electronics, embedded systems, energy, and software engineering principles to real-world problems.

### Scalable Solutions

Our products are designed with scalability and future integration in mind.

### Real-World Impact

We focus on technologies that deliver measurable value to homes, businesses, institutions, and industries.

---

## 🏭 Industries & Applications

MOTECH solutions can support a wide range of sectors, including:

* Energy & Utilities
* Solar Energy
* Manufacturing
* Construction
* Commercial Buildings
* Education
* Healthcare
* Government
* Telecommunications
* Residential Applications
* Industrial Facilities
* Smart Infrastructure

---

## 🌐 Website Features

The MOTECH website provides:

* Responsive desktop and mobile design
* Modern technology-focused interface
* Product showcase
* Product-specific contact sections
* Smart Energy Management System access
* Company information
* Contact form
* Direct email and phone links
* Animated user interface
* Mobile navigation
* SEO-friendly structure
* MOTECH branding and favicon

---

## 🎨 Branding

The website follows the MOTECH visual identity using a combination of:

* Electric Blue (`#00AEEF`)
* Technology Green (`#59C414`)
* Dark Navy (`#07111F`)
* Black (`#000000`)
* Silver (`#C7D2DC`)

The official MOTECH logo is used throughout the website and as the **browser favicon**.

### Brand Motto

> **Engineering Intelligence. Powering Tomorrow.**

---

## 📁 Project Structure

```
MOTECH-TECHNOLOGY-WEBSITE/
├── public/                      # Static assets (images, fonts, favicon)
│   └── ...
├── src/
│   ├── components/              # Reusable React components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── ...
│   ├── pages/                   # Page components (routes)
│   │   ├── Home.tsx
│   │   ├── Store.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── auth/
│   │   ├── portal/
│   │   └── admin/
│   ├── contexts/                # React Context providers
│   │   └── AuthContext.tsx
│   ├── data/                    # Static data & constants
│   │   └── site.ts
│   ├── utils/                   # Utility functions
│   ├── hooks/                   # Custom React hooks
│   ├── assets/                  # Images, SVGs, etc.
│   ├── styles/                  # Global styles
│   ├── App.tsx                  # Root component
│   └── index.tsx                # Entry point
├── .env.example                 # Environment variables template
├── .env.local                   # Local environment config (not committed)
├── .env.production              # Production environment config
├��─ .prettierrc.json             # Code formatting config
├── .gitattributes               # Git line ending config
├── eslint.config.js             # ESLint rules
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite build config
├── tailwind.config.js           # Tailwind CSS config
├── postcss.config.js            # PostCSS config
├── package.json                 # Dependencies & scripts
├── CONTRIBUTING.md              # Contribution guidelines
├── DEVELOPMENT.md               # Development guide
├── LICENSE                      # MIT License
└── README.md                    # This file
```

---

## 📦 Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.5.4 | Type safety |
| **Vite** | 5.2.0 | Build tool & dev server |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS framework |
| **React Router** | 6.26.2 | Client-side routing |
| **Framer Motion** | 11.5.4 | Animation library |
| **Lucide React** | 0.522.0 | Icon library |
| **Emotion** | 11.13.3 | CSS-in-JS styling |

---

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format with Prettier
npm run format:check    # Check formatting without changes
```

---

## 🔧 Development Guide

For detailed development instructions, environment setup, debugging tips, and troubleshooting, see [DEVELOPMENT.md](DEVELOPMENT.md).

---

## 🤝 Contributing

We welcome contributions! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

* Code style and naming conventions
* Component structure
* Commit message format
* Pull request process
* Testing requirements

---

## 🌍 Environment Variables

### Required Variables

Create a `.env.local` file based on `.env.example`:

```env
VITE_API_URL=http://localhost:3001
VITE_ENERGY_DASHBOARD_URL=https://dashboard.motechenergyembedded.com/
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=false
```

See `.env.example` for all available configuration options.

---

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**Dependencies Not Installing:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Build Fails:**
```bash
rm -rf dist
npm run build
```

For more troubleshooting tips, see [DEVELOPMENT.md](DEVELOPMENT.md#troubleshooting).

---

## 📞 Contact MOTECH

**MOTECH Embedded Engineering Ltd**

📧 **Email:** [motechembeddedengineering@gmail.com](mailto:motechembeddedengineering@gmail.com)

📱 **Phone:** +254 791 052 537

For product demonstrations, technical discussions, partnerships, deployments, or engineering inquiries, please contact the MOTECH team.

---

## 🔗 Important Links

* [Energy Management Dashboard](https://dashboard.motechenergyembedded.com/)
* [MOTECH Official Website](#)

---

## 📄 License

Copyright © 2026 **MOTECH Embedded Engineering Ltd**.

Licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

All rights reserved. Unless otherwise stated, the website design, branding, content, graphics, product concepts, and associated intellectual property are the property of MOTECH Embedded Engineering Ltd.

---

## 📊 Repository Stats

![Language Distribution](https://img.shields.io/github/languages/top/Mohanelli11/MOTECH-TECHNOLOGY-WEBSITE?style=flat-square)
![Repo Size](https://img.shields.io/github/repo-size/Mohanelli11/MOTECH-TECHNOLOGY-WEBSITE?style=flat-square)

---

<p align="center">

**MOTECH Embedded Engineering Ltd**

### Engineering Intelligence. Powering Tomorrow.

[Website](https://motech.local) | [Email](mailto:motechembeddedengineering@gmail.com) | [Phone](tel:+254791052537)

</p>
