# Architecture Notes

## Overview

This project uses Domain-Driven Design (DDD) with Clean Architecture boundaries.
The intent is to keep business rules independent from transport and persistence details.

## Layered Structure

1. **Domain** (`src/credit-engine/domain`)
   - Pure business model and policies
   - Entity: `Customer`
   - Value objects: `Location`, `MarketDebt`, `ClassificationResult`
   - Domain service: `ClassificationEngine`
   - Repository contracts (interfaces only)
   - No NestJS, HTTP, or JSON loading concerns

2. **Application** (`src/credit-engine/application`)
   - Use-case orchestration (`ClassifyCustomerUseCase`)
   - Coordinates domain service and repository contract
   - Handles application flow, not framework details

3. **Infrastructure** (`src/credit-engine/infrastructure`)
   - Concrete adapters and data access
   - `RulesJsonRepository` implements the domain repository interface
   - Maps external JSON shape into domain rule objects

4. **Interfaces** (`src/credit-engine/interfaces`)
   - HTTP controller, DTOs, request validation, and mappers
   - Swagger documentation metadata
   - Input/output adaptation only

## Dependency Rule

Dependencies point inward:

- Interfaces -> Application -> Domain
- Infrastructure -> Domain

Domain never depends on application, interfaces, or infrastructure.

## Entity vs Value Object

**Entity**

- `Customer`
- Has stable identity (`id`)
- Lifecycle can evolve over time

**Value objects**

- `Location`, `MarketDebt`, `ClassificationResult`
- Defined by attributes (value equality semantics)
- Reusable across multiple entities if needed

## Why a Domain Service

`ClassificationEngine` is a domain service because the classification algorithm combines multiple policy sets (clusters, job category matching, penalty factors, income matrix) and does not naturally belong to a single entity.

## Request Lifecycle

1. Controller receives `POST /customers/classify` DTO.
2. Use case maps DTO -> domain objects.
3. Use case loads rules via repository interface.
4. Domain service computes cluster, category, penalty, limit, and income.
5. Mapper converts domain result -> response DTO.

## Data-Driven Rules

All business rules are externalized in JSON (`src/credit-engine/infrastructure/rules/rules.json`) and mapped to domain types. This allows business rule updates without rewriting core decision logic.

## References

- DDD: Eric Evans, Domain-Driven Design; Vaughn Vernon, Implementing Domain-Driven Design
- Clean Architecture: Robert C. Martin, The Clean Architecture
- Fowler patterns: Domain Model, Service Layer, and Anemic Domain Model discussions