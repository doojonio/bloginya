# Mojolicious Plugins

This document describes the custom Mojolicious plugins used in this project.

## CoolIO

Provides input validation helpers. It uses a schema-based approach to validate incoming data from requests. It can validate single values, hashes, and arrays. It also handles exceptions and promise chains.

### Default Schemas

The `CoolIO::DefaultSchemaList` module defines a default set of schemas for the `CoolIO` plugin, such as `num`, `bool`, `uuid`, `str`, etc.

### Custom Schemas

The `CoolIO::SchemaList` module is a helper for creating custom schema lists for the `CoolIO` plugin.

## DB

Manages database connections (PostgreSQL and Redis). It provides helpers for accessing the database handles and automatically disconnects after the request is finished.

## Log4perl

Integrates the `Log::Log4perl` logging framework with Mojolicious. It redirects Mojolicious' default logger and Perl's `warn` function to Log4perl.

## Service

A dependency injection plugin for services. It automatically discovers services in the `Bloginya::Service` namespace and injects them into other services or controllers.

## WebHelpers

Provides a set of helpers for web-related tasks, such as getting the user's real IP address, managing session cookies, and handling user authentication.
