# Security Vulnerabilities

This document details the security vulnerabilities identified in the HMNP site dependencies and their potential impact.

## High Severity Vulnerabilities

### 1. Next.js HTTP Request Deserialization DoS (CVE-2024-37022)

**Package:** next  
**Vulnerable versions:** >=15.5.1-canary.0 <15.5.10  
**Fix version:** >=15.5.10  
**Impact:** This vulnerability can lead to Denial of Service when using insecure React Server Components. An attacker can craft specially formed HTTP requests that lead to excessive deserialization processing.

### 2. Axios Denial of Service (CVE-2023-45857)

**Package:** axios  
**Vulnerable versions:** <=1.13.4  
**Fix version:** >=1.13.5  
**Impact:** Axios is vulnerable to Denial of Service via a specially crafted __proto__ key in mergeConfig. An attacker can potentially cause application crashes.

### 3. Nodemailer DoS (CVE-2024-32004)

**Package:** nodemailer  
**Vulnerable versions:** <=7.0.10  
**Fix version:** >=7.0.11  
**Impact:** Nodemailer's addressparser is vulnerable to DoS caused by recursive calls when processing specific email address formats, potentially crashing the application.

### 4. JWS Signature Verification (CVE-2022-25903)

**Package:** jws (via jsonwebtoken)  
**Vulnerable versions:** <3.2.3  
**Fix version:** >=3.2.3  
**Impact:** The jws package improperly verifies HMAC signatures, which could lead to signature forgery under specific conditions.

### 5. tar File Overwrite Vulnerabilities (CVE-2024-25583, CVE-2024-25582, CVE-2023-46235)

**Package:** tar  
**Vulnerable versions:** <=7.5.3, <=7.5.2, <7.5.7  
**Fix version:** >=7.5.7  
**Impact:** Multiple vulnerabilities in the tar package allow arbitrary file overwriting or creation via path traversal, which could be exploited during package extraction.

### 6. Preact JSON VNode Injection (CVE-2023-48243)

**Package:** preact  
**Vulnerable versions:** >=10.27.0 <10.27.3  
**Fix version:** >=10.27.3  
**Impact:** Preact has a JSON VNode injection vulnerability that could allow attackers to execute arbitrary code under specific conditions.

### 7. fast-xml-parser DoS (CVE-2024-6267)

**Package:** fast-xml-parser  
**Vulnerable versions:** >=5.0.9 <=5.3.3  
**Fix version:** >=5.3.4  
**Impact:** A RangeError DoS can occur in the numeric entities parser of fast-xml-parser, potentially crashing applications parsing untrusted XML.

## Moderate Severity Vulnerabilities

### 1. Nodemailer Domain Confusion (CVE-2024-4971)

**Package:** nodemailer  
**Vulnerable versions:** <7.0.7  
**Fix version:** >=7.0.7  
**Impact:** Email could be sent to an unintended domain due to interpretation conflicts in how email addresses are parsed.

### 2. Lodash Prototype Pollution (CVE-2024-3344)

**Package:** lodash, lodash-es  
**Vulnerable versions:** >=4.0.0 <=4.17.22  
**Fix version:** >=4.17.23  
**Impact:** Prototype pollution vulnerability in the `_.unset` and `_.omit` functions could allow attackers to modify object behavior.

### 3. Undici HTTP Response Decompression (CVE-2024-36129)

**Package:** undici  
**Vulnerable versions:** <6.23.0  
**Fix version:** >=6.23.0  
**Impact:** Undici has an unbounded decompression chain in HTTP responses on Node.js Fetch API via Content-Encoding which can lead to resource exhaustion.

## Low Severity Vulnerabilities

### 1. tmp Symbolic Link Vulnerability (CVE-2023-46234)

**Package:** tmp  
**Vulnerable versions:** <=0.2.3  
**Fix version:** >=0.2.4  
**Impact:** The tmp package allows arbitrary file/directory writes via symbolic link in the `dir` parameter.

### 2. diff DoS Vulnerability (CVE-2023-1123)

**Package:** diff  
**Vulnerable versions:** >=4.0.0 <4.0.4  
**Fix version:** >=4.0.4  
**Impact:** jsdiff has a Denial of Service vulnerability in parsePatch and applyPatch functions.

### 3. webpack URL Bypass Vulnerabilities (CVE-2024-3267, CVE-2024-3083)

**Package:** webpack  
**Vulnerable versions:** >=5.49.0 <=5.104.0, >=5.49.0 <5.104.0  
**Fix version:** >=5.104.1  
**Impact:** webpack's buildHttp functionality is vulnerable to URL validation bypasses that can lead to SSRF behavior.

### 4. qs DoS Vulnerabilities (CVE-2023-46305, CVE-2024-28182)

**Package:** qs  
**Vulnerable versions:** <6.14.1, >=6.7.0 <=6.14.1  
**Fix version:** >=6.14.2  
**Impact:** The qs package has arrayLimit bypass vulnerabilities that can lead to memory exhaustion and denial of service.

## Impact on the Application

These vulnerabilities primarily pose risks in the following areas:

1. **Denial of Service (DoS):** Many of the vulnerabilities could allow attackers to crash the application or make it unresponsive.
2. **Resource Exhaustion:** Some vulnerabilities can lead to excessive CPU or memory usage.
3. **File System Access:** The tar vulnerabilities could potentially allow unauthorized file system access during package extraction.
4. **Data Integrity:** The jws vulnerability could theoretically allow signature forgery under specific conditions.

## Mitigation Steps

1. Update the direct dependencies to their fixed versions
2. Add overrides in package.json for transitive dependencies
3. Run a complete set of tests to ensure application functionality
4. Document all changes for future reference
5. Implement a regular security audit schedule

See [SECURITY_UPDATE_PLAN.md](SECURITY_UPDATE_PLAN.md) for the detailed update plan.