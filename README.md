# Appointment Management System

A full-stack appointment management system designed with **high availability, fault tolerance, and data reliability** in mind. The system includes ETL pipelines, node tolerance mechanisms, and data replication to ensure resilience under failure scenarios.

Built and tested as a systems-focused project combining modern web technologies with distributed system concepts.

---

## 🚀 Features

* **Appointment Scheduling & Management**

  * Create, update, and view appointments
  * Persistent storage with SQL-backed data models

* **High Availability & Fault Tolerance**

  * Node tolerance to handle partial system failures
  * Data replication to prevent single points of failure
  * Designed to continue operating during node outages

* **ETL Pipelines**

  * Extract, transform, and load appointment data
  * Supports downstream analytics and reporting

* **Data Analytics & Visualization**

  * Structured data exported for visualization
  * Tableau used for reporting and insights

* **Test Coverage**

  * Unit and integration testing with Jest
  * Focus on system reliability and correctness

---

## 🧱 Tech Stack

**Frontend**

* React
* Next.js
* TypeScript

**Backend**

* Node.js
* TypeScript
* RESTful APIs

**Database & Data**

* SQL
* JSON
* Data replication mechanisms
* ETL workflows

**Testing & Analytics**

* Jest
* Tableau

**Platform**

* Linux

---

## ⚙️ Setup & Installation

### Prerequisites

* Node.js (v18+ recommended)
* SQL database (local or containerized)
* Linux environment (preferred)

### Installation

```bash
git clone https://github.com/ikkai-r/apptsmanagementsystem.git
cd apptsmanagementsystem
npm install
```

### Run the application

```bash
npm run dev
```

---
