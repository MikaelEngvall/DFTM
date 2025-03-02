# 📅 DFTM - Digital Facility Task Manager

En modern uppgiftshanterare för fastighetsförvaltning byggd med React och Spring Boot, med stöd för flera språk och användarnivåer.

## 📁 Projektstruktur

```
DFTM/
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Calendar.tsx
│   │   │   ├── CreateTaskModal.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginModal.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── PendingTasksManager.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── TaskDetailModal.tsx
│   │   │   ├── UserManagementPage.tsx
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       ├── Dialog.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Notification.tsx
│   │   │       ├── Select.tsx
│   │   │       └── Spinner.tsx
│   │   │
│   │   ├── i18n/
│   │   │   └── locales/
│   │   │       ├── en.json
│   │   │       ├── pl.json
│   │   │       ├── sv.json
│   │   │       └── uk.json
│   │   │
│   │   ├── services/
│   │   │   └── api/
│   │   │       ├── axiosConfig.ts
│   │   │       ├── taskApi.ts
│   │   │       └── userApi.ts
│   │   │
│   │   ├── types/
│   │   │   ├── task.ts
│   │   │   └── user.ts
│   │   │
│   │   ├── utils/
│   │   │   └── taskAdapters.ts
│   │   │
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   └── index.html
│
├── src/
│   └── main/
│       └── java/
│           └── com/
│               └── dftm/
│                   ├── config/
│                   ├── controller/
│                   │   ├── AuthController.java
│                   │   ├── PendingTaskController.java
│                   │   ├── TaskController.java
│                   │   └── UserController.java
│                   │
│                   ├── model/
│                   │   ├── PendingTask.java
│                   │   ├── Task.java
│                   │   ├── TaskPriority.java
│                   │   ├── TaskStatus.java
│                   │   └── User.java
│                   │
│                   ├── repository/
│                   │   ├── PendingTaskRepository.java
│                   │   ├── TaskRepository.java
│                   │   └── UserRepository.java
│                   │
│                   └── service/
│                       ├── PendingTaskService.java
│                       ├── TaskService.java
│                       └── UserService.java
└── README.md
```

## ✨ Funktioner

- **Uppgiftshantering**:
  - Skapa, visa, uppdatera och ta bort uppgifter
  - Väntande uppgifter (Pending Tasks) som måste godkännas
  - Prioritetsnivåer (LOW, MEDIUM, HIGH, URGENT)
  - Statushantering (PENDING, IN_PROGRESS, COMPLETED, APPROVED, REJECTED)
  
- **Kalendervy**:
  - Visualisera uppgifter baserat på förfallodatum
  - Organisera uppgifter per dag
  - Filtrera uppgifter baserat på status

- **Användarhantering**:
  - Flera användarroller (ROLE_USER, ROLE_ADMIN, ROLE_SUPERADMIN)
  - Användarprofilhantering
  - Behörighetskontroll baserat på roller

- **Flerspråksstöd**:
  - Svenska
  - Engelska
  - Polska
  - Ukrainska

- **Anpassningsfunktioner**:
  - Ljust och mörkt tema
  - Användarspecifika språkinställningar
  - Responsiv design för olika skärmstorlekar

## 🛠️ Använda teknologier

### Frontend
- React
- TypeScript
- Tailwind CSS
- i18next (internationalisering)
- Axios
- Headless UI

### Backend
- Java 21
- Spring Boot 3.x
- Spring Security med JWT-autentisering
- MongoDB
- Lombok
- Maven

## 📋 Förutsättningar

- Node.js ^16.0.0
- npm ^8.0.0
- Java 21
- Maven ^3.8.0
- MongoDB ^5.0

## 🚀 Installation

### Frontend
1. Navigera till frontend-katalogen:
   ```
   cd frontend
   ```

2. Installera beroenden:
   ```
   npm install
   ```

### Backend
1. Navigera till projektroten och kompilera projektet med Maven:
   ```
   mvn clean install
   ```

## 🎮 Köra applikationen

### Frontend
1. Starta utvecklingsservern:
   ```
   cd frontend
   npm run dev
   ```

2. Öppna webbläsaren och navigera till:
   ```
   http://localhost:5173
   ```

### Backend
1. Starta Spring Boot-applikationen:
   ```
   mvn spring-boot:run
   ```

2. Backend-API:et kommer att vara tillgängligt på:
   ```
   http://localhost:8080/api/v1
   ```

## 🔑 Standardanvändare

- **Superadmin**
  - Email: admin@example.com
  - Lösenord: password
  - Roll: ROLE_SUPERADMIN

- **Vanlig användare**
  - Email: user@example.com
  - Lösenord: password
  - Roll: ROLE_USER

## 👨‍💻 Författare

Mikael Engvall

## 📄 Licens

Detta projekt är licenserat under MIT-licensen. 