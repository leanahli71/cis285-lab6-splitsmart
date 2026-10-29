# Feature Specification: SplitSmart Expense Sharing

**Feature Branch**: Not created (no `before_specify` hook is configured)

**Created**: 2026-10-29

**Status**: Draft

**Input**: Authoritative customer requirements in `UserRequirement.md`; user request
to produce a testable feature specification and separately identify a Java Swing
MVP subset.

## Clarifications

### Session 2026-10-29

- Q: Who pays an expense, and who may participate in its allocation? → A: Exactly one user is the upfront payer; one or more participants may include or exclude the payer.
- Q: Which users may participate in group expenses, and are individual expenses outside groups supported? → A: Group participants must be active group members; direct one-to-one expenses outside groups are supported.
- Q: How are monetary amounts and allocation discrepancies calculated? → A: Use BigDecimal with standard half-up rounding to two decimal places; allocate any remaining one-cent discrepancy to the payer, or to the first participant if needed.
- Q: Which expense amounts are valid? → A: Expense amounts must be strictly positive; zero and negative amounts are rejected.
- Q: What percentage total is valid for a percentage split? → A: Participant percentages must total exactly 100.00%; any other sum is rejected.
- Q: How do users authenticate? → A: Each user signs in locally with a username and password.
- Q: How are notifications delivered in the Java Swing MVP, and what is deferred? → A: The MVP uses in-app badges, dialogs, or an activity feed; push notifications are deferred to web and mobile platforms.
- Q: How do direct payments affect balances? → A: Recording a payment between two users immediately reduces the debtor's amount owed and increases the creditor's payment balance; partial settlements are allowed.
- Q: When does a group expense affect settled balances? → A: It remains Pending until reviewed and approved by its participants; only then does it affect settled balances.

## Actors

- **Account holder**: A person who signs in and views their own expenses and balances.
- **Group member**: An account holder who belongs to a shared-expense group and can
  participate in its expenses.
- **Expense payer**: The single user who covers an expense's upfront cost. The
  payer may or may not participate in the allocation.
- **Expense participant**: A user who receives a share of an expense. Group
  expense participants must be active members of that group.
- **Approver**: A participant in a group expense who reviews and approves it.
- **Settlement sender**: A person who sends money to settle an amount owed and
  records the payment. This role is distinct from the expense payer.
- **System**: SplitSmart, which applies approvals, updates balances, notifies
  members, and prepares reports.

One person can act in more than one role. Group-specific permission details are
listed under Open Questions.

## Customer Requirement Inventory

This inventory preserves the feature areas stated in `UserRequirement.md`.
Requirement IDs are used throughout this specification and MUST remain traceable
to the customer source, design, and verification.

| Customer feature | Requirement IDs | Customer-requested outcome |
|---|---|---|
| User accounts | FR-001 | Each person has an account, can log in, and can access their own expense and balance information. |
| Group management | FR-002 | Users create and manage groups for roommates, trips, parties, or other participants. |
| Expense creation and allocation | FR-003, FR-004 | A new expense records amount, date, description, equal or percentage split, optional receipt, and involved users. |
| Notifications | FR-006 | Members are notified when another group member creates an expense. |
| Approval workflow | FR-005 | Expenses are reviewed and approved before being included in balances; groups may use one or multiple approval levels. |
| Balance tracking | FR-007 | The system tracks what each user owes every other user based on entered expenses. |
| Payment tracking | FR-008 | Users record payments that settle amounts owed and are reflected in balances. |
| Reporting | FR-009 | Users view expense, balance, and payment summaries, with custom date ranges and other parameters. |
| Supported platforms | FR-010 | The primary product is web-based and is also available on Android and iOS. |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Access personal information (Priority: P1)

As a person who shares expenses, I want my own account so I can sign in and
access my expenses and balances.

**Why this priority**: Personal access is the foundation for identifying users,
protecting their information, and participating in groups.

**Independent Test**: Create two accounts, sign in separately, and verify that
each sees their own account context and cannot access the other's private view.

**Acceptance Scenarios**:

1. **Given** a person has a unique username and password, **When** they enter
   valid credentials, **Then** they sign in and can view their own expenses and
   balances.
2. **Given** a person is not signed in, **When** they attempt to open a
   protected personal or group view, **Then** access is denied and they are
   prompted to sign in.
3. **Given** a person has not created an account, **When** they try to sign in
   with a username and password, **Then** sign-in is denied.

### User Story 2 - Organize shared expenses in a group (Priority: P1)

As a group organizer, I want to create and manage a group so its members can
track shared expenses together.

**Why this priority**: Groups provide the shared context for expenses,
participants, approvals, notifications, and balances.

**Independent Test**: Create a group, add members, and verify that a member can
see the group and its shared activity.

**Acceptance Scenarios**:

1. **Given** a signed-in user, **When** they create a group with a name,
   **Then** the group exists and the creator is a member.
2. **Given** a group member, **When** they view a group, **Then** they can see
   its members and shared expenses but cannot see unrelated groups.
3. **Given** a user without group-management permission, **When** they attempt
   to change group membership or settings, **Then** the change is refused.
4. **Given** a group owner, **When** they invite a person by email, **Then**
   that person has no group access until they accept the invitation and sign in
   with a local username and password.

### User Story 3 - Submit and review a shared expense (Priority: P1)

As a user, I want to record an expense, designate who paid and who participated,
and have group expenses approved so the resulting balances are accurate.

**Why this priority**: Capturing and validating expense details is the core
activity that creates accurate shared obligations.

**Independent Test**: Submit a group expense with participants and a split,
have all participants approve it, and verify the expense becomes eligible for
balance calculations.

**Acceptance Scenarios**:

1. **Given** a member of a group, **When** they submit an expense with valid
   amount, date, description, one payer, active group participants, and
   allocation, **Then** the expense is recorded with Pending status.
2. **Given** a group expense with Pending status, **When** its participants
   review and approve it, **Then** it becomes approved and affects settled
   balances.
3. **Given** a group expense with Pending status, **When** any participant
   rejects it, **Then** it remains outside settled balances.
4. **Given** a group expense with Pending status, **When** a nonparticipant
   attempts to approve it, **Then** the action is refused.
### User Story 4 - Understand and settle what is owed (Priority: P1)

As a user, I want to see who owes whom and record settlement payments so that
balances reflect approved expenses and payments.

**Why this priority**: Accurate, understandable balances and settlement records
turn expense entry into useful group accounting.

**Independent Test**: Approve an expense shared by two members, verify the
resulting obligation, record a payment, and verify the remaining balance.

**Acceptance Scenarios**:

1. **Given** an approved expense shared by multiple members, **When** a member
   views balances, **Then** the system shows the resulting amount owed between
   each relevant pair of users.
2. **Given** an outstanding balance, **When** its settlement sender records a
   valid payment against it, **Then** the payment is recorded and the remaining
   balance is reduced by that amount immediately.
3. **Given** a rejected or pending expense, **When** a member views balances,
   **Then** that expense has not changed the balance.

### User Story 5 - Stay informed about group expenses (Priority: P2)

As a group member, I want to be notified when another member creates an expense
so that I can review relevant activity promptly.

**Why this priority**: Notifications make shared activity visible and help
members respond to expenses that require review.

**Independent Test**: Create an expense as one group member and verify that
other members receive an expense-created notification.

**Acceptance Scenarios**:

1. **Given** a group with multiple members, **When** one member creates an
   expense, **Then** relevant members can see an in-app badge, dialog, or
   activity-feed item identifying the group and expense.
2. **Given** a user who is not a member of the group, **When** an expense is
   created in that group, **Then** that user receives no group notification.

### User Story 6 - Review expense, balance, and payment reports (Priority: P2)

As a group member, I want summaries and filtered reports so I can understand
shared spending and settlement activity over a chosen period.

**Why this priority**: Reports help members review activity beyond individual
expense and balance entries.

**Independent Test**: Create approved expenses and payments on different dates,
request a report for a selected period, and verify that only matching activity
is included in the applicable totals.

**Acceptance Scenarios**:

1. **Given** expenses and payments in a group, **When** a member opens a
   summary, **Then** expense, balance, and payment information is available.
2. **Given** a valid date range and report parameters, **When** a member
   requests a report, **Then** the result includes only records matching those
   parameters.
3. **Given** a date range with no matching activity, **When** a member requests
   a report, **Then** the report shows an empty result and zero applicable
   totals rather than unrelated records.

### User Story 7 - Record a direct one-to-one expense (Priority: P1)

As a user, I want to record a shared expense directly with one other person
without creating or joining a group.

**Why this priority**: People sometimes share costs with one person without
needing ongoing group management.

**Independent Test**: Record a direct expense between two users, verify the
upfront payer and participants, and confirm the resulting balance is visible
to both users.

**Acceptance Scenarios**:

1. **Given** two registered users, **When** one records an expense outside a
   group with one payer and participants selected from those two users,
   **Then** the expense is recorded and their balances reflect the allocation.
2. **Given** a direct expense between two users, **When** the payer is not
   selected as a participant, **Then** the other user can be assigned the full
   expense share without adding a group.

### Edge Cases

- A zero or negative expense amount, invalid date, missing description, missing
  payer, or empty participant list is rejected with a clear explanation.
- A group expense cannot include a person who is not an active member of that
  group. A direct one-to-one expense is recorded outside any group.
- A percentage split must total exactly 100.00%; any other sum is rejected.
- Monetary calculations use decimal arithmetic and half-up rounding to two
  decimal places. Any one-cent allocation discrepancy is assigned to the payer,
  or to the first participant if the payer cannot receive it.
- A group expense remains Pending until approved by its participants; pending
  and rejected group expenses do not change settled balances.
- Only the debtor records a settlement payment. Partial and full payments
  immediately update the debtor's and creditor's balances.
- Notifications and reports must respect group membership and personal access;
  MVP notifications are displayed within the application.
- A report with an invalid date range is rejected; a valid range with no matches
  returns an empty report.
- An optional receipt may be omitted; if supplied, it must be associated with
  the correct expense and visible only to authorized users.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow a person to create an individual account,
  authenticate locally with a unique username and password, and access their
  own expense and balance information.
- **FR-002**: The system MUST allow authorized users to create and manage groups,
  including their membership. A group owner MUST be able to invite a person by
  email; an invitee MUST gain access only after accepting the invitation and
  signing in with a local username and password. The system MUST limit group
  information to authorized group members.
- **FR-003**: The system MUST allow an authenticated user to create an expense
  with an amount, date, description, allocation method (equal or percentage),
  optional receipt image, exactly one upfront payer, and one or more
  participants. The payer MUST be allowed to be included or excluded from the
  participants. Group expenses MUST be created by group members. Expense
  amounts MUST be strictly greater than zero. When percentage allocation is
  used, participant percentages MUST total exactly 100.00%; any other total
  MUST be rejected.
- **FR-004**: The system MUST allow expenses to be recorded within a group or as
  direct one-to-one expenses between two distinct users outside a group. Every
  participant in a group expense MUST be an active member of that group.
- **FR-005**: A group expense MUST remain in Pending status until its
  participants have each reviewed and approved it. If any participant rejects
  it, the expense MUST be rejected. Only an approved group expense MUST affect
  settled balances. A rejected or pending group expense MUST NOT affect settled
  balances.
- **FR-006**: When a group member creates an expense, the Java Swing MVP MUST
  display an in-app alert badge, dialog, or activity-feed item to relevant
  group members and MUST NOT expose it to non-members. Push notifications are
  deferred to web and mobile platforms.
- **FR-007**: The system MUST track the amount each user owes every other user
  from applicable expenses and recorded payments. For an approved expense,
  each participant other than the upfront payer owes their allocated share to
  the payer; no user owes a balance to themselves.
- **FR-008**: The system MUST allow only the person sending money to record a
  partial or full settlement payment against their outstanding obligation.
  Recording a payment MUST immediately reduce the debtor's amount owed and
  increase the creditor's balance by the same amount. Partial
  settlements MUST be permitted; the recorded amount MUST NOT exceed the
  outstanding obligation.
- **FR-009**: The system MUST provide expense, balance, and payment summaries,
  and MUST allow a user to generate a report using a specified date range and
  additional supported parameters.
- **FR-010**: The complete customer-requested product MUST be primarily
  web-based and also available on Android and iOS. A Java Swing desktop MVP
  alone does not satisfy this requirement.

### Non-Functional Requirements

- **NFR-001**: A user MUST only be able to access their own account information
  and direct expenses in which they are the payer or a participant, plus
  information for groups of which they are an authorized member. The
  application MUST authenticate locally using each user's username and
  password.
- **NFR-002**: All monetary calculations MUST use BigDecimal with standard
  `ROUND_HALF_UP` rounding to two decimal places. For every valid approved expense,
  participant allocations plus any rounding discrepancy adjustment MUST equal
  the expense total exactly. Assign the discrepancy to the payer if the payer
  is a participant; otherwise assign it to the first participant. The system
  MUST display consistent amounts in expenses, balances, payments, and reports.
- **NFR-003**: Under normal conditions, 95% of account, group, expense, balance,
  payment, and report actions MUST present a result or actionable validation
  message within 3 seconds.
- **NFR-004**: A group member MUST be able to complete a standard equal-split
  expense entry, excluding approval, in 90 seconds or less in at least 90% of
  observed attempts.
- **NFR-005**: Notifications, reports, and receipt access MUST not expose
  another group's or an unauthorized user's private information.

### Acceptance Criteria by Requirement

| Requirement | Acceptance criteria |
|---|---|
| FR-001 | AC-001, AC-002, AC-020 |
| FR-002 | AC-003, AC-004, AC-019 |
| FR-003 | AC-005, AC-006, AC-007 |
| FR-004 | AC-007, AC-021, AC-022 |
| FR-005 | AC-008, AC-009, AC-025 |
| FR-006 | AC-010, AC-023 |
| FR-007 | AC-011, AC-012 |
| FR-008 | AC-013, AC-024 |
| FR-009 | AC-014, AC-015 |
| FR-010 | AC-016 |
| NFR-001 | AC-002, AC-004, AC-026 |
| NFR-002 | AC-006, AC-011, AC-013, AC-024 |
| NFR-003 | AC-017 |
| NFR-004 | AC-018 |
| NFR-005 | AC-004, AC-010, AC-015 |

### Acceptance Criteria

- **AC-001**: Given two registered accounts with unique usernames, when each
  signs in with their local username and password, then each enters only their
  own account context.
- **AC-002**: Given a signed-out user, when they open an account or group view,
  then access is denied until they sign in.
- **AC-003**: Given a signed-in user, when they create a group, then the group
  exists and the creator is listed as a member.
- **AC-004**: Given a user who is not authorized for a group, when they request
  its membership, expenses, receipt, or reports, then no group data is returned.
- **AC-005**: Given an expense with a valid amount, date, description,
  payer, participants, allocation, and optional receipt, when a group expense
  is submitted, then those details are retained and its state is Pending. A
  valid direct one-to-one expense is recorded without group approval.
- **AC-006**: Given an expense amount greater than zero and an allocation, when
  shares are calculated, then every share is rounded half-up to two decimal
  places using BigDecimal; any remaining discrepancy is assigned to the payer
  if they are a participant, or otherwise to the first participant, so the
  allocations equal the expense total. Zero and negative amounts are rejected.
  A percentage allocation totaling anything other than exactly 100.00% is
  rejected.
- **AC-007**: Given an expense, when its payer and participants are recorded,
  then exactly one payer is stored separately from one or more participants,
  and the payer may be included in or excluded from the participants.
- **AC-008**: Given a group expense with Pending status, when every participant
  has reviewed and approved it, then its status changes to Approved and it
  affects settled balances.
- **AC-009**: Given a group expense with Pending status, when any participant
  rejects it, then its status changes to Rejected and it does not affect
  settled balances.
- **AC-010**: Given an expense created in a group, when the Java Swing MVP
  displays its notification, then relevant group members can see it as an
  in-app badge, dialog, or activity-feed item, and nonmembers cannot see it.
- **AC-011**: Given an approved expense, when a member views balances, then each
  participant other than the payer owes their allocated share to the payer,
  no user owes a balance to themselves, any rounding discrepancy adjustment
  follows the payer/first-participant rule, and all allocations sum to the
  expense total.
- **AC-012**: Given a pending or rejected expense, when a member views balances,
  then no obligation from that expense is included.
- **AC-013**: Given an outstanding obligation, when its debtor records a
  partial or full payment no greater than the amount owed, then the payment is
  recorded immediately and the debtor's amount owed decreases by exactly that
  amount; a creditor or other user cannot record it, and an excessive payment
  is rejected.
- **AC-014**: Given expense, balance, and payment activity, when an authorized
  user views a summary, then all three categories are represented.
- **AC-015**: Given a valid date range and supported report parameters, when a
  report is requested, then only matching records and their corresponding totals
  are returned; an empty range returns zero totals.
- **AC-016**: Given a release described as the complete customer-requested
  product, when platform availability is checked, then web, Android, and iOS
  experiences are available; a desktop-only release is identified as an MVP and
  not as complete customer-request fulfillment.
- **AC-017**: In 100 representative normal-condition actions, at least 95
  present a result or actionable validation message within 3 seconds.
- **AC-018**: In observed usability testing, at least 90% of participants can
  submit a valid equal-split expense within 90 seconds, excluding approval.
- **AC-019**: Given a person invited to a group by email, when they have not
  accepted the invitation and signed in with a local username and password,
  then they cannot access that group's information; after both steps, they can
  access it as a member.
- **AC-020**: Given a username and password that do not match an account, when
  the person attempts to sign in, then access is denied.
- **AC-021**: Given a group expense, when a user who is not an active member of
  that group is selected as a participant, then submission is rejected.
- **AC-022**: Given two users who are not using a group, when one records a
  direct one-to-one expense between them with one payer and one or more
  participants selected from those two users, then the expense can be recorded
  and balances can be calculated without group membership.
- **AC-023**: Given a new group expense in the Java Swing MVP, when a relevant
  group member views the application, then the member can see an in-app badge,
  dialog, or activity-feed notification; push notification delivery is not
  required in the MVP.
- **AC-024**: Given an outstanding debtor-creditor balance, when the debtor
  records a valid partial or full payment, then the debtor's amount owed
  decreases and the creditor's balance increases by the same amount
  immediately.
- **AC-025**: Given a group expense with Pending status, when all participants
  approve it, then it becomes Approved; if any participant rejects it, then it
  becomes Rejected, and neither Pending nor Rejected expenses affect settled
  balances.
- **AC-026**: Given a direct one-to-one expense, when a user who is neither its
  payer nor a participant requests its details, then the system does not return
  that expense or its balance information.

### Key Entities

- **User account**: A person's unique username, local password credentials, and
  private expense and balance access.
- **Group**: A named shared-expense context with active members, pending email
  invitations, and management permissions.
- **Expense**: A dated, described monetary item with exactly one payer, one or
  more participants, an allocation method, optional receipt, and review status.
  It is associated with a group or is a direct one-to-one expense outside a
  group.
- **Expense share**: One participant's allocated portion of an expense.
- **Approval**: A participant's review decision on a group expense, including
  the expense, reviewer, decision, and decision time.
- **Notification**: An expense-created alert associated with a group member and
  expense; the desktop MVP displays it in-app.
- **Balance**: The amount one user owes another after approved expenses and
  recorded payments.
- **Payment**: A recorded settlement amount, debtor, creditor, date, and related
  obligation.
- **Report**: A view or summary of expense, balance, and payment records selected
  by date range and other supported parameters.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of first-time test participants can sign in, create a
  local account with a username and password, create a group, and submit a
  valid shared expense without assistance.
- **SC-002**: In 100 verified expense calculations covering equal splits,
  percentage splits, and fractional-cent cases, 100% of calculations use
  half-up rounding to two decimal places and allocations reconcile to the
  source expense total after the payer/first-participant adjustment.
- **SC-003**: For every tested approval, rejection, and payment workflow,
  balances match the approved expenses and recorded payments exactly.
- **SC-004**: At least 95% of tested expense-created notifications appear as an
  in-app badge, dialog, or activity-feed item for relevant members within one
  minute, and none are visible to nonmembers.
- **SC-005**: For 100 representative report requests, all returned records and
  totals match the requested date range and parameters.
- **SC-006**: The complete-product release passes platform verification for
  web, Android, and iOS; any Java Swing desktop MVP is reported separately and
  is not counted as satisfying this criterion.

## Assumptions

- A group expense uses the group's configured currency; a direct one-to-one
  expense uses the currency selected for that expense. Multi-currency balance
  conversion is not assumed.
- Expense amounts must be strictly positive. Expenses with no participants or
  invalid allocations cannot be submitted.
- Percentages must total exactly 100.00%. Shares are rounded half-up to two
  decimal places; any discrepancy is assigned to the payer if the payer is a
  participant, or otherwise to the first participant.
- All participants must approve a group expense; any participant rejection
  rejects the expense. Direct one-to-one expenses are recorded as approved and
  affect balances immediately because they are not group expenses. Confirm
  whether direct expenses also need participant review.
- Only the debtor records a settlement payment; a valid partial or full payment
  immediately decreases the debtor's amount owed and increases the creditor's
  payment balance. A payment cannot exceed the outstanding amount.
- Group creators manage membership unless the group explicitly grants those
  actions to another member. Group-expense participants must be active members.
- Each user authenticates locally with a username and password.
- The Java Swing MVP displays expense-created notices within the application;
  push notification delivery is deferred to web and mobile platforms.
- The one-minute in-app notification target is a provisional product
  assumption, not a confirmed customer requirement.
- A Java Swing desktop MVP is a project implementation choice, not a customer
  requirement, and does not resolve the customer's web, Android, and iOS
  platform requirement.

## Java Swing MVP Subset (Implementation Scope)

This subsection identifies an implementation subset and is not a replacement
for the customer requirement inventory. The MVP is a desktop demonstration of
selected SplitSmart workflows; it MUST NOT be represented as full
customer-request fulfillment.

| MVP coverage | Included subset | Excluded or reduced from the complete requirement |
|---|---|---|
| Accounts and groups | FR-001 and FR-002: local username/password access, group creation, email invitations, and group-scoped access. | Detailed recovery and group-administration permissions remain unspecified. |
| Expenses | FR-003 and FR-004: create dated/described group or direct one-to-one expenses, identify one payer and participants, and attach an optional receipt; MVP allocation is equal split. | Percentage splits are outside the MVP. |
| Approval | FR-005: every participant reviews a group expense before it affects settled balances. | Direct expenses are recorded as approved under the MVP assumption. |
| Notifications | FR-006: in-app badges, dialogs, or activity-feed items for group expense creation. | Push notifications are deferred to web and mobile platforms. |
| Balances and payments | FR-007 and FR-008: calculate pairwise balances and immediately record partial or full direct settlements. | Multi-currency conversion and overpayment handling are outside the MVP. |
| Reports | FR-009: expense, balance, and payment summaries with a date-range filter. | Custom report parameters beyond date range are outside the MVP. |
| Platforms | Java Swing desktop UI for the MVP. | FR-010's web, Android, and iOS availability is not delivered by a desktop-only MVP. |

The implementation context is Java 21, Maven, Java Swing, and JUnit 5. Business
logic remains separate from GUI behavior; monetary calculations use
`BigDecimal` with `ROUND_HALF_UP` to two decimal places; maintained architecture
and behavior diagrams use PlantUML. These are project implementation decisions
governed by the constitution, not customer-stated requirements.

## Open Questions

1. What account recovery, invitation, and group membership permissions are
   required beyond the baseline assumptions?
2. Do direct one-to-one expenses also require participant review before
   affecting balances?
3. What behavior is required when an in-app notification cannot be displayed,
   or when a future web/mobile notification cannot be delivered?
4. Which currencies must be supported, and are multiple currencies needed
   within one group?
5. Which report parameters beyond date range are required (for example,
   member, group, category, or expense status)?
6. What receipt image formats, maximum sizes, and retention rules are required?
7. Is a desktop Swing MVP an approved interim deliverable alongside the
   customer's web-first and Android/iOS product, or must the customer platform
   requirement be addressed in the first delivery?
8. Must zero or negative settlement payment amounts be rejected, or are other
   payment validation rules required?
9. Which notification channels beyond the Java Swing MVP's in-app notices are
   required on web and mobile?
