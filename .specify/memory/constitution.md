<!--
Sync Impact Report
Version change: uninitialized → 1.0.0
Modified principles: None; the prior file contained only scaffold placeholders.
Added sections: Implementation Decisions and Customer Requirements; Development
  Workflow; five Core Principles.
Removed sections: None.
Follow-up TODOs: Confirm the original ratification date; resolve how the desktop
  Swing implementation relates to the customer's web and Android/iOS platform
  requirement before claiming full platform coverage.
-->

# SplitSmart Constitution

## Core Principles

### I. Java 21, Maven, and Swing
The application MUST use Java 21, Maven for dependency and build management, and
Java Swing for its graphical user interface. These are implementation decisions
that constrain this project; they MUST NOT be presented as requirements stated
by the customer.

### II. Object-Oriented Design and Layer Separation
The application MUST use cohesive object-oriented components with clear
responsibilities. Business rules, expense allocation, approval decisions, and
balance calculations MUST remain independent of Swing components and event
handlers. The GUI MUST gather and present information through the business
logic's interfaces rather than implement those rules itself. This separation
allows business behavior to be tested without launching the GUI.

### III. Exact Monetary Arithmetic
All monetary values and calculations MUST use `BigDecimal`; `float` and `double`
MUST NOT be used for money. Amount parsing, scale, rounding, and validation MUST
be explicit at system boundaries and consistent across expense splits, balances,
and payment recording. Exact decimal arithmetic prevents binary floating-point
errors from corrupting user-visible amounts.

### IV. JUnit 5 and Requirement Traceability
Automated tests MUST use JUnit 5. Each customer requirement adopted for
implementation MUST be traceable from its source to the design and to one or
more verification checks, with requirement identifiers or an equivalent
unambiguous reference. Tests MUST cover monetary calculations and business
rules, including relevant boundary cases; GUI tests MUST be added where behavior
cannot be adequately verified below the presentation layer.

### V. PlantUML and Human Review of AI Output
Architecture and behavior diagrams maintained for the project MUST use
PlantUML, and MUST be updated when a change materially alters the represented
design or interactions. AI-generated code, tests, diagrams, and documentation
are proposals only: a human MUST review their correctness, requirement fit,
maintainability, and safety before accepting them. AI output MUST NOT be treated
as evidence that a requirement is satisfied.

## Implementation Decisions and Customer Requirements

The customer request is recorded in [UserRequirement.md](../../UserRequirement.md).
It asks for user accounts; group management; expense creation with equal or
percentage splits and optional receipts; notifications; expense approval;
balance and payment tracking; reporting; and a primarily web-based product with
Android and iOS apps.

Java 21, Maven, Swing, JUnit 5, PlantUML, object-oriented design, GUI/business
logic separation, and `BigDecimal` are implementation decisions or engineering
constraints supplied for this project, not additional customer requirements.
They MUST be documented as such in specifications and design artifacts.

Swing is a desktop UI technology and does not by itself satisfy the customer's
web, Android, or iOS platform requirement. Specifications MUST record this
coverage gap and MUST NOT claim full customer-request fulfillment unless the
platform scope is resolved and the required platforms are supported or the
customer approves a changed scope.

## Development Workflow

Each feature specification MUST distinguish customer-stated requirements from
implementation choices and identify its source. Adopted requirements MUST have
traceable design and verification references. PlantUML diagrams MUST be
reviewed with the design they describe. Changes MUST be built and tested with
the project's Java 21 and Maven configuration, including the applicable JUnit 5
tests. Reviewers MUST confirm requirement coverage, monetary correctness, layer
boundaries, and human review of any AI-generated contribution before accepting
the change.

## Governance

This constitution governs project decisions and takes precedence over
conflicting local development conventions. Amendments MUST be reviewed and
approved by the project owner or an explicitly authorized maintainer. An
amendment MUST record its rationale, affected principles or sections, and
consequences for existing requirements, designs, tests, and implementation.
Customer requirement changes MUST be distinguished from implementation
decision changes.

Constitution versions use semantic versioning (`MAJOR.MINOR.PATCH`). A MAJOR
increment denotes an incompatible change to governance or existing principles;
a MINOR increment adds a principle or materially expands governance; a PATCH
increment makes a non-semantic clarification or correction. Compliance MUST
be reviewed when proposals are accepted and before a release, including
requirement traceability, applicable tests, and unresolved customer-scope gaps.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): confirm original adoption date | **Last Amended**: 2026-10-29
