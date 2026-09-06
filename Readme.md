# TeamFlow — Mini SaaS Workspace Platform

TeamFlow is a production-grade workspace collaboration platform inspired by Notion, Trello, and Slack. It features real-time state synchronization, role-based access control (RBAC), multi-tier performance caching with Redis, background job scheduling with BullMQ, and complete Docker orchestration.

---

## Key Features

- **Real-Time Collaboration**: Dynamic task updates and team presence powered by Socket.io.
- **Performance Layer**: Redis caching with automated invalidation for read-heavy operations (e.g., workspace membership).
- **Background Worker Engine**: BullMQ processing email dispatching independently of client request loops.
- **PWA & Offline Capability**: Built using `vite-plugin-pwa` with service workers and a live connectivity status monitor.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions across Admin, Member, and Viewer roles.
- **Dockerized Architecture**: Multi-stage production containerization orchestrated with Docker Compose.
- **Automated CI/CD**: GitHub Actions pipeline checking frontend builds, environment verification, and Docker image construction.

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Vite PWA
- **Backend**: Node.js, Express, Socket.io, BullMQ, ioredis, Mongoose
- **Database & Cache**: MongoDB, Redis Cloud
- **DevOps & Infrastructure**: Docker, Docker Compose, Nginx, GitHub Actions

---

## Architecture Diagram

```mermaid
flowchart TD
    User["Browser / PWA"] -->|"HTTP / WebSocket"| Nginx["Nginx Proxy (Port 3000)"]
    Nginx -->|"Reverse Proxy (Port 8000)"| Backend["Express Backend"]
    Backend -->|"Database Queries"| Mongo[("MongoDB")]
    Backend -->|"Read-through Cache"| Redis[("Redis Cloud")]
    Backend -->|"Job Producer"| BullMQ["BullMQ Queue"]
    BullMQ -->|"Async Job Consumer"| Worker["Email Background Worker"]
```

```mermaid
erDiagram
    USER ||--o{ WORKSPACE : "owns"
    USER ||--o{ WORKSPACE_MEMBER : "participates as"
    USER ||--o{ WORKSPACE_INVITE : "invites"
    USER ||--o{ PROJECT : "leads"
    USER ||--o{ TASK : "assigned to"
    USER ||--o{ TASK : "reports"
    USER ||--o{ DOCUMENT : "authors"
    USER ||--o{ CONVERSATION : "creates"
    USER ||--o{ MESSAGE : "sends"
    USER ||--o{ ACTIVITY : "triggers"

    WORKSPACE ||--|{ WORKSPACE_MEMBER : "contains"
    WORKSPACE ||--o{ WORKSPACE_INVITE : "issues"
    WORKSPACE ||--o{ PROJECT : "contains"
    WORKSPACE ||--o{ TASK : "organizes"
    WORKSPACE ||--o{ DOCUMENT : "stores"
    WORKSPACE ||--o{ CONVERSATION : "hosts"
    WORKSPACE ||--o{ MESSAGE : "scopes"
    WORKSPACE ||--o{ ACTIVITY : "records"

    PROJECT ||--o{ TASK : "contains"
    PROJECT ||--o{ DOCUMENT : "organizes"
    PROJECT ||--o{ ACTIVITY : "tracks"

    TASK ||--o{ ACTIVITY : "logs"
    CONVERSATION ||--o{ MESSAGE : "contains"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string avatarUrl
        string refreshToken
        date createdAt
        date updatedAt
    }

    WORKSPACE {
        ObjectId _id PK
        string name
        string slug UK
        ObjectId ownerId FK
        date createdAt
        date updatedAt
    }

    WORKSPACE_MEMBER {
        ObjectId _id PK
        ObjectId workspaceId FK
        ObjectId userId FK
        string role "OWNER or ADMIN or MEMBER or VIEWER"
        date joinedAt
        date createdAt
        date updatedAt
    }

    WORKSPACE_INVITE {
        ObjectId _id PK
        ObjectId workspaceId FK
        string email
        string role "ADMIN or MEMBER or VIEWER"
        string token UK
        ObjectId inviterId FK
        date expiresAt
        date createdAt
        date updatedAt
    }

    PROJECT {
        ObjectId _id PK
        ObjectId workspaceId FK
        string name
        string description
        string key
        ObjectId leadId FK
        ObjectIdArray members FK
        number taskCounter
        string status "ACTIVE or ARCHIVED"
        date createdAt
        date updatedAt
    }

    TASK {
        ObjectId _id PK
        ObjectId workspaceId FK
        ObjectId projectId FK
        number taskNumber
        string taskKey
        string title
        string description
        string status "BACKLOG or TODO or IN_PROGRESS or IN_REVIEW or DONE"
        string priority "LOW or MEDIUM or HIGH or URGENT"
        ObjectId assigneeId FK
        ObjectId reporterId FK
        date dueDate
        stringArray tags
        date createdAt
        date updatedAt
    }

    DOCUMENT {
        ObjectId _id PK
        ObjectId workspaceId FK
        ObjectId projectId FK
        string title
        string content
        ObjectId authorId FK
        ObjectIdArray allowedMembers FK
        stringArray tags
        boolean isArchived
        date createdAt
        date updatedAt
    }

    CONVERSATION {
        ObjectId _id PK
        ObjectId workspaceId FK
        string type "CHANNEL or DIRECT"
        string name
        string description
        ObjectIdArray participants FK
        ObjectId lastMessage FK
        date lastMessageAt
        ObjectId createdBy FK
        date createdAt
        date updatedAt
    }

    MESSAGE {
        ObjectId _id PK
        ObjectId conversationId FK
        ObjectId workspaceId FK
        ObjectId senderId FK
        string content
        ObjectIdArray readBy FK
        date createdAt
        date updatedAt
    }

    ACTIVITY {
        ObjectId _id PK
        ObjectId workspaceId FK
        ObjectId userId FK
        ObjectId projectId FK
        ObjectId taskId FK
        string action
        object metadata
        date createdAt
        date updatedAt
    }
```

