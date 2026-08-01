/** Shared Mermaid sources for curriculum diagrams (web + docs copy). */

export const DIAGRAM_OBJECT_GRAPH = `flowchart LR
  IdentityProfile[IdentityProfile] --> Identity
  IdentityProfile --> Lifecycle[LifecycleState]
  Identity --> Account
  Source --> Account
  Account --> Entitlement
  Entitlement --> AccessProfile
  AccessProfile --> Role
  Lifecycle -.->|drives provisioning| Source`

export const DIAGRAM_AUTH_FLOW = `sequenceDiagram
  participant Script
  participant OAuth as OAuthToken
  participant API as ISC_API
  Script->>OAuth: POST client_credentials
  OAuth-->>Script: access_token ~12min
  Script->>API: Authorization Bearer
  alt 401
    API-->>Script: invalid or expired token
  else 403
    API-->>Script: scope or user level
  else 429
    API-->>Script: rate limited backoff
  else 2xx
    API-->>Script: payload
  end`

export const DIAGRAM_VERSIONING = `flowchart TB
  subgraph legacy [Legacy yearly]
    Y["/v2026/identities"]
    Latest["/latest/..."]
  end
  subgraph modern [Per-service July 2026]
    S["/identities/v1"]
  end
  Y -->|migrate| S
  Latest -->|unsafe for prod| S
  EOL["Legacy EOL Q1 2029"] -.-> legacy`

export const DIAGRAM_LEAVER = `sequenceDiagram
  participant Bot as Integration
  participant IdAPI as Identities_v1
  participant Prof as IdentityProfiles
  Bot->>IdAPI: GET filters alias eq
  IdAPI-->>Bot: identity id + before state
  Bot->>Prof: list lifecycle states by name
  Prof-->>Bot: Terminated id
  Bot->>IdAPI: set-lifecycle-state
  Bot->>IdAPI: GET verify after state`

export const DIAGRAM_EXTENSIBILITY = `flowchart TD
  Need[Change needed] --> Q1{Attribute mapping only?}
  Q1 -->|yes| Transform
  Q1 -->|no| Q2{Event side effects HTTP?}
  Q2 -->|yes| Workflow
  Q2 -->|no| Q3{New Source aggregate provision?}
  Q3 -->|yes| SaaSConnector[SaaS Connectivity]
  Q3 -->|no| Q4{Tweak OOTB connector IO?}
  Q4 -->|yes| Customizer
  Q4 -->|no| Q5{Complex BeanShell logic?}
  Q5 -->|yes| Rule
  Q5 -->|no| ExternalAPI[External API script]`

export const DIAGRAM_SEARCH_VS_LIST = `flowchart LR
  subgraph listPath [List APIs]
    F[filters query] --> O[offset pagination]
    O --> Fresh[Near real-time]
  end
  subgraph searchPath [Search]
    Q[query DSL] --> SA[searchAfter]
    SA --> Lag[Index lag possible]
  end
  ITDR[ITDR disable] --> listPath
  Report[Analytics report] --> searchPath`

export const DIAGRAM_CONNECTOR_LIFECYCLE = `flowchart TD
  Test[testConnection] --> ListAcct[account list]
  ListAcct --> Read[account read]
  ListAcct --> Ent[entitlement ops]
  Read --> Prov[create update disable]
  Ent --> Prov`

export const DIAGRAM_REF_ARCH = `flowchart LR
  ITDR[ITDR_SIEM] -->|lifecycle API| ISC
  HR[HR_Source] -->|aggregation| ISC
  ISC -->|provisioning| Apps[Target_apps]
  Peer[Peer_provisioner] -->|access requests| ISC
  Compliance[Compliance_bridge] -->|certifications search| ISC`
