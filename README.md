# 🎓 Campus Approval System (Bonafide)

A comprehensive digital platform designed to streamline administrative requests and certificate approvals in educational institutions. This system replaces manual paperwork with an efficient, role-based digital workflow.

![Dashboard Preview](https://github.com/manasaistanly/campus-approval-system/raw/main/preview.png)
*(Note: Add a screenshot of your dashboard as `preview.png` to your repo)*

## ✨ Key Features

- **🔐 Role-Based Access Control (RBAC)**: secure hierarchy including Student, Tutor, HOD, Principal, Office, and Admin.
- **📄 Digital Workflow**: Students request certificates (Bonafide, Scholarship) which pass through a multi-stage approval chain.
- **⚡ Real-time Notifications**: Email alerts for status updates (Approved, Rejected, Ready for Collection).
- **📊 Admin Dashboard**: Centralized user management and role assignment.
- **📂 Document Management**: Upload supporting proofs securely.
- **📱 Modern UI**: Fully responsive design built with **Next.js** and **Shadcn UI**.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: React Context

### Backend
- **Framework**: [NestJS](https://nestjs.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Email**: Nodemailer (SMTP)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/manasaistanly/campus-approval-system.git
    cd campus-approval-system
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    npm install
    
    # Configure Environment
    cp .env.example .env
    # Update .env with your DATABASE_URL and SMTP credentials
    
    # Run Migrations & Seed Data
    npx prisma db push
    npx prisma db seed
    
    # Start Server
    npm run start:dev
    ```

3.  **Setup Frontend**
    ```bash
    cd ../frontend
    npm install
    
    # Configure Environment
    cp .env.example .env.local
    # Update NEXT_PUBLIC_API_URL=http://localhost:3001
    
    # Start Development Server
    npm run dev
    ```

4.  **Access the App**
    - Frontend: `http://localhost:3000`
    - Backend API: `http://localhost:3001`

## 🔑 Default Credentials (Seed Data)

- **Admin**: `manasaistanly0@gmail.com` / `Stanly@231`
*(Note: Create other users via the Admin Dashboard or Signup page)*

## 🌍 Deployment

- **Frontend**: Deploy to **Vercel** (Zero config).
- **Backend**: Deploy to **Railway** or **Render**.
- **Database**: Use a managed PostgreSQL (Railway/Neon).

## 📄 License

This project is licensed under the MIT License.
