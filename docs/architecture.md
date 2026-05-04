# Architecture Notes

## Domain Entity vs Value Object

**Entity**
- Customer
- Identity: `id`
- Behavior: classification uses customer state plus rule configuration

**Value Objects**
- Location
- MarketDebt
- ClassificationResult
- Rule definitions (ClusterRule, JobCategoryRule, PenaltyRule)

Value objects are defined by their attributes and do not have a separate lifecycle or identity in this domain. Entities are identified by stable IDs and can evolve over time.

## Domain Service

The classification logic is implemented as a domain service because it combines multiple policies (cluster rules, job categories, penalties, income matrix) that do not belong to a single entity.

## Application Service

The use case orchestrates the domain service and the rules repository. It adapts the request DTO into domain types and returns a response DTO.

## Data-Driven Rules

Business rules live in JSON config and are mapped into domain rule types via a repository implementation. This allows changes to rules without touching domain logic.
