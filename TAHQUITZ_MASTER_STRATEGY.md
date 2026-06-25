# TAHQUITZ MASTER STRATEGY & ARCHITECTURE

## 1. Project Mission & Identity
**Tahquitz** is an ultra-premium, hardware-agnostic VVIP Cabin Software Ecosystem designed by Kovach Design. The goal is to aggressively disrupt legacy IFE/CMS providers (IDAIR, Collins Venue, Honeywell, Nice) by providing an unmatched, modern, and fluid user experience that rivals consumer tech (Apple/Tesla) rather than legacy aviation software.

## 2. The Four Core Ecosystem Pillars
The Tahquitz ecosystem is strictly separated into four intercommunicating pillars:

1. **Tahquitz Apex (The Cloud Backend & Fleet Manager)**
   - Serves as the "single pane of glass" for aircraft OEMs, completion centers, and fleet operators.
   - Handles the entire lifecycle of an aircraft from day 1 to end-of-life.
2. **Tahquitz Core (The Local OS & Protocol Driver)**
   - The secure, containerized local OS residing on the aircraft's servers.
   - Acts as the hardware-agnostic translation layer (via ARINC, RS485, Ethernet) ensuring the GUI never talks directly to legacy hardware.
3. **Tahquitz Vista (The VVIP Frontend GUI)**
   - The ultra-luxury, context-aware web-based frontend for passengers and crew.
   - Features rich aesthetics, glassmorphism, 3D interactive maps, and fluid micro-animations.
4. **AI Testing Matrix (QA & Validation)**
   - The automated testing framework that validates all logic across the ecosystem before deployment.

## 3. The Tahquitz Apex 4-Phase Lifecycle
The Apex Portal operates as a state machine governing the life of an aircraft:

* **Phase 1: Initiation (RFQ & BAFO)**
  - Customers upload an RFQ PDF containing the aircraft LOPA and hardware requirements.
  - Tahquitz AI parses the RFQ, automatically generates a Graphics Requirements Document (GRD), pruning unnecessary screens (e.g., skipping video mocks for lavatories), and outputs a Best and Final Offer (BAFO).

* **Phase 2: In Development (Skunkworks & Device Simulator)**
  - The project enters development. Customers get access to a live Dashboard to live-skin their GUI.
  - Features **Hex Color Sliders** for live theming, logo uploading, and LOPA zone renaming.
  - Features the **Role-Based Device Simulator**: Customers must approve the GUI across 5 distinct form factors (Crew Terminal, Passenger Tablet, BYOD Phone, Handset, 4.3" Wall Controller).

* **Phase 3: Validation (ATP & Rack Testing)**
  - Software is released to the physical test rack.
  - An Acceptance Test Procedure (ATP) is generated. The customer enters a feedback loop to leave Change Requests (CRs) based on physical testing.

* **Phase 4: In Service (Active Fleet Manager)**
  - Aircraft goes live in the fleet. The dashboard transforms into a Spafax/Nice hybrid CMS.
  - **CSDB Sync:** Shows a custom-rendered livery silhouette, tracks the current software version vs. offered updates, and allows Over-The-Air (OTA) remote edits to Light Scenarios and Speaker profiles.
  - **Media CMS:** A Spafax-inspired analytics suite showing Genre/Distributor pie charts and facilitating Scheduled Release Cycles (e.g., "Deploy July 2026 Media Load on July 1").

## 4. Design & Aesthetic Directives
- **Zero Generic UI:** Avoid plain colors. Use curated HSL palettes, deep dark modes (OLED blacks), and smooth gradients.
- **Dynamic Interaction:** The interface must feel alive. Use Framer Motion for micro-animations, slide-overs, and tactile switch feedback.
- **Premium Skeuomorphism:** Blend flat modern design with tactile, premium skeuomorphic elements (e.g., metallic dials, frosted glass).
- **Responsive & Role-Based:** The UI must adapt seamlessly across devices while restricting data/control access based on role (Crew vs. VIP vs. Guest).
