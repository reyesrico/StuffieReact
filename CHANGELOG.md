# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security
- Updated axios from ^1.13.2 to ^1.13.5 to fix CVE-2026-25639 (Denial of Service via __proto__ key in mergeConfig)
  - Fixed in both root package and packages/stuffie-connect package
  - Vulnerability severity: High (CVSS 7.5)
  - GitHub Advisory: [GHSA-43fc-jf86-j433](https://github.com/advisories/GHSA-43fc-jf86-j433)
