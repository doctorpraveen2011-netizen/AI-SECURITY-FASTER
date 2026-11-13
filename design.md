# DESIGN SYSTEM & UI/UX SPECIFICATION
## AI SECURITY FASTER — LeetCode & CyberSOC Visual Standard
**Visual Specification:** Reference Implementation based on `media_1794580612660_3f0ca8b8.jpg`  
**Theme:** CyberSOC Deep Black with LeetCode Accent Orange & Glowing Cybernetics  

---

## 1. Color Palette & Theming Tokens

| Token Name | Hex Code | Purpose & Usage |
|---|---|---|
| `--bg-main` | `#080808` | Primary background across all pages and sidebars. |
| `--bg-secondary` | `#111111` | Secondary container fill, modal backgrounds, and header bars. |
| `--bg-card` | `#171717` | Card background with high-contrast isolation. |
| `--bg-card-hover` | `#1f1f1f` | Hover state for interactive cards and table rows. |
| `--border-subtle` | `#222222` | Crisp 1px border for card separation. |
| `--border-highlight`| `rgba(255, 138, 0, 0.3)` | Glowing orange active border for focused and selected elements. |
| `--primary-accent` | `#FF8A00` | Signature LeetCode/SOC orange for buttons, active tabs, and badges. |
| `--secondary-accent`| `#FFB347` | Lighter warm orange for gradients, sparklines, and progress bars. |
| `--text-primary` | `#FFFFFF` | Primary headers, values, and prominent titles. |
| `--text-secondary` | `#A3A3A3` | Subtitles, labels, descriptions, and metadata. |
| `--text-muted` | `#666666` | Placeholder text, disabled items, and footer notes. |
| `--status-success` | `#00C784` | Mitigated status, secure connections, passed tests, blocked attacks. |
| `--status-danger` | `#FF4545` | Vulnerabilities found, critical risks, failed tests. |
| `--status-warning` | `#FFC247` | Medium severity alerts, pending human approvals. |
| `--status-purple` | `#A855F7` | Avg scan time metric, advanced model badges. |

---

## 2. Typography & Iconography

- **Font Family:** Inter / JetBrains Mono (monospace for test cases, IDs, payloads, and code snippets).
- **Header Hierarchy:**
  - H1: `24px` / `SemiBold` (e.g. "Welcome to AI Security Faster")
  - H2: `18px` / `SemiBold` (Card Headers: "Models & Tools", "Risk Coverage", "Attack Test Cases")
  - H3: `14px` / `Medium` (Sub-headers & category titles)
  - Body: `13px` / `Normal` / `#A3A3A3`
  - Code/Telemetry: `12px` / `JetBrains Mono` / `#FFB347`
- **Icon Set:** Lucide React icons (`Shield`, `Bot`, `Swords`, `CheckCircle`, `AlertTriangle`, `Clock`, `Download`, `Cpu`, `FileText`, `Terminal`, `Network`, `Layers`, `Settings`).

---

## 3. UI Layout Grid (Reference Screenshot Alignment)

```text
+-------------------------------------------------------------------------------------------------------------------+
|  [SHIELD] AI SECURITY FASTER   [ Search attacks, risks... ]       [ Claude v ] [ Gemini v ]  (•) System Online [P]|
+-------------------+-----------------------------------------------------------------------------------------------+
| [O] Overview      | +-------------------------------------------------------------------------------------------+ |
| [ ] LLM Chat      | | [SHIELD] Welcome to AI Security Faster                 [ GLOWING BRAIN ]                  | |
| [ ] AI Agent      | | Automated Red-Teaming & Blue-Teaming for LLMs and AI Agents    Test • Detect • Mitigate • Stay | |
| [ ] Attack Tests  | +-------------------------------------------------------------------------------------------+ |
| [ ] MCP Connector | | [ Total Tests: 48 ] | [ Vulns Found: 27 ] | [ Mitigated: 24 ] | [ Avg Scan Time: 2m 14s ]   | |
| [ ] Mitigations   | +-------------------------------------+-----------------------------------------------------+ |
| [ ] Reports       | | [ROBOT] Models & Tools              | [SHIELD] Risk Coverage (OWASP 2026)                 | |
| [ ] Integrations  | | [Claude] [Gemini]  Tools: File/Mail | [LLM Top 10] [Agentic Top 10]                       | |
| [ ] Settings      | +-------------------------------------+-----------------------------------------------------+ |
|                   | | [SWORDS] Attack Test Cases          | [SHIELD] Mitigation Results                         | |
|                   | | LLM01: Prompt Inj  Claude 3/3 Gemini| LLM01: High (87%) -> Low (12%)                      | |
|                   | | LLM02: Sens Info   Claude 3/3 Gemini| LLM02: High (82%) -> Low (9%)                       | |
|                   | | LLM03: Supply Ch   Claude 3/3 Gemini| ASI05: Medium (61%) -> Low (14%)                    | |
|                   | | LLM08: Ex Agency   Claude 3/3 Gemini| MCP:   High (79%) -> Low (11%)                      | |
|                   | | LLM10: Vector Mis  Claude 3/3 Gemini|                                                     | |
|                   | +-------------------------------------+-----------------------------------------------------+ |
|                   | | [PLUG] MCP Connection Risk          | [CHART] Test Reports              [ Download Report ]| |
|                   | | [✓ Connection Secure] (Risk 11%)    | [ Line Chart: Vulns vs Mitigated ] Last: Nov 12 19:45 | |
|                   | | POC: Path traversal blocked.        |                                                     | |
+-------------------+-----------------------------------------------------------------------------------------------+
| Powered by OWASP  |                                                                                               |
+-------------------+-----------------------------------------------------------------------------------------------+
```

---

## 4. Key Component Specifications

### 4.1 Top KPI Metrics Cards
- 4-column responsive grid on desktop (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).
- Rounded corners (`rounded-xl`), `#171717` background with subtle 1px border `#222222`.
- Left-side circular badge icon with soft background tint (`bg-orange-500/10 text-orange-400`).
- Prominent integer display (`text-2xl font-bold text-white`).
- Right-hand mini sparkline SVG rendered with cubic bezier smooth stroke in matching theme color.

### 4.2 Models & Tools Panel
- Model Selector segmented pill button:
  - Claude button: Orange sun icon with glowing border when active.
  - Gemini button: Google multi-color G icon with active cyan/indigo glow.
- Agent Tools Badges:
  - 4 status badges: `File Read`, `Email`, `HTTP Call`, `MCP Tools`.
  - Indicator pills showing tool state: `Active / Sandboxed` with tooltip detailing access rules.

### 4.3 Risk Coverage Panel
- Segmented tab switch: `[LLM Top 10]` vs `[Agentic Top 10]`.
- Chip badges with glowing colored indicator dots:
  - Orange dot for OWASP LLM risks (`LLM01`, `LLM02`, `LLM08`, `LLM10`).
  - Agentic dots for ASI risks (`ASI01`, `ASI02`, `ASI03`, `ASI05`, `ASI06`).

### 4.4 Attack Test Cases Panel
- Card header with crossed swords icon and "Attack Test Cases".
- List of risk rows featuring:
  - Colored risk badge (`LLM01` in red, `LLM02` in orange, `LLM03` in purple, `LLM08` in emerald, `LLM10` in blue).
  - Risk title and test count ("3+ Tests").
  - Model progress bars: `Claude 3/3 ✓` with 100% orange bar, `Gemini 3/3 ✓` with 100% orange bar.
  - Interactive drill-down chevron opening the test case modal with verbatim prompts and evidence.

### 4.5 Mitigation Results Panel
- Header with green shield icon and status badge: `All Mitigations Applied ✓`.
- Table columns:
  - Target category name
  - `Before Mitigation`: Dark red badge with high risk percentage (e.g. `High Risk (87%)`).
  - Transition arrow: `→` (neutral gray `#666666`).
  - `After Mitigation`: Dark emerald badge with low risk percentage (e.g. `Low Risk (12%)`).

### 4.6 MCP Connection Risk Panel
- Two-column split card:
  - Left card: Large green shield checkmark, "Connection Secure", "Risk Score: 11%".
  - Right card: "POC Result: Attempted path traversal (../../etc/shadow) blocked." with green `Blocked` pill and orange outline button `View Details →`.

### 4.7 Test Reports Panel
- Recharts responsive container rendering dual curves:
  - Orange line (`#FF8A00`): Vulnerabilities count across days Mon-Sun.
  - Emerald line (`#00C784`): Mitigated count across days Mon-Sun.
  - Custom dark tooltip showing exact numbers and audit IDs.
- Header button: `Download Report` with download tray icon.
- Timestamp badge: `Last Scan: Nov 12, 2026 • 19:45`.

