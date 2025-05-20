# S3 Object ClamAV Scanner Lambda

## 1. Overview

This AWS Lambda function (`index.mjs`) is triggered by S3 object creation events. It downloads the new object, scans it for viruses using ClamAV, and takes action based on the scan results:
- **Clean files:** Tags the S3 object with `clamav-scan-status: clean`.
- **Infected files (or scan errors):** Deletes the S3 object and logs the incident. May tag the object with `clamav-scan-status: error` or `clamav-scan-status: infected` before deletion or if deletion fails.

This setup enhances the security of your S3 bucket by preventing the storage of known malicious files.

## 2. Prerequisites

- An AWS Account.
- AWS CLI installed and configured with appropriate credentials and default region.
- An existing S3 bucket (e.g., `your-s3-bucket-name-hmnp`) where files will be uploaded. The Lambda will scan objects typically in a `client-uploads/` prefix.
- Node.js environment for local development/packaging if not using pre-built layers/packages directly in AWS console.

## 3. Deployment Steps

### 3.1. Packaging ClamAV (Custom Lambda Layer Strategy)

ClamAV binaries and its virus definition files (`.cvd`, `.cld`) need to be available to the Lambda function. For maximum control over the ClamAV version and its update process, we will build a custom AWS Lambda Layer.

**General Process for Building a Custom ClamAV Layer:**

This process involves compiling ClamAV from source in an environment that matches the Lambda execution environment (e.g., Amazon Linux 2 or a Docker container based on an Amazon Linux 2 image) and then packaging the necessary files.

1.  **Set up Build Environment:**
    *   Launch an Amazon EC2 instance using an Amazon Linux 2 AMI. The instance type can be `t2.micro` or `t3.micro` for building, but ensure sufficient disk space (e.g., 20-30GB).
    *   Alternatively, use Docker with an `amazonlinux:2` image.

2.  **Install Build Tools and Dependencies:**
    *   Connect to your EC2 instance (or Docker container).
    *   Install necessary development tools and ClamAV dependencies. For example:
        ```bash
        sudo yum update -y
        sudo yum groupinstall "Development Tools" -y
        sudo yum install -y openssl-devel pcre2-devel zlib-devel json-c-devel libxml2-devel ncurses-devel bzip2-devel
        # Check ClamAV documentation for the latest list of dependencies for the version you intend to build.
        ```

3.  **Download and Compile ClamAV Source:**
    *   Download the latest stable ClamAV source tarball from the official ClamAV website (e.g., `clamav-<version>.tar.gz`).
    *   Extract, configure, compile, and install ClamAV. The installation prefix should be a temporary location from which you'll copy files for the layer package (e.g., `/tmp/clamav-install`).
        ```bash
        # Example (replace <version> and paths as needed):
        wget https://www.clamav.net/downloads/production/clamav-<version>.tar.gz
        tar -xzf clamav-<version>.tar.gz
        cd clamav-<version>
        ./configure --prefix=/tmp/clamav-install --sysconfdir=/tmp/clamav-install/etc --with-openssl --enable-json-shared=no --disable-bzip2 --disable-xml
        # Review ./configure --help for options. Disabling bzip2/xml can reduce size if not needed.
        make -j$(nproc)
        make install
        ```

4.  **Prepare Layer Package Structure:**
    *   The Lambda Layer needs a specific directory structure so that when it's unzipped into `/opt` in the Lambda environment, your `index.mjs` script can find ClamAV.
    *   The `index.mjs` script defaults to:
        *   `CLAMSCAN_PATH = /opt/clamav/bin/clamscan`
        *   `VIRUS_DEFS_PATH = /opt/clamav/defs`
    *   Create a staging directory for your layer, for example, `mkdir -p /tmp/clamav-layer/clamav/bin /tmp/clamav-layer/clamav/lib /tmp/clamav-layer/clamav/defs`.
    *   Copy the necessary compiled binaries (e.g., `clamscan`, `freshclam` if you plan to use it for definition updates within another Lambda) and libraries from your install prefix (`/tmp/clamav-install`) to the corresponding locations in `/tmp/clamav-layer/clamav/`.
        *   Binaries: `/tmp/clamav-install/bin/clamscan` -> `/tmp/clamav-layer/clamav/bin/`
        *   Libraries: `/tmp/clamav-install/lib64/*` -> `/tmp/clamav-layer/clamav/lib/` (ensure you get `libclamav.so*` etc.)
    *   Consider running `ldd /tmp/clamav-install/bin/clamscan` to see all shared library dependencies and ensure they are either system-provided in Lambda or included in your layer's `lib` directory.

5.  **Download Initial Virus Definitions:**
    *   Download `main.cvd`, `daily.cvd`, and `bytecode.cvd` from `https://database.clamav.net/` or use `freshclam` (if compiled) to download them into your staging area: `/tmp/clamav-layer/clamav/defs/`.
        ```bash
        # Using freshclam (if compiled and configured):
        # /tmp/clamav-install/bin/freshclam --config-file=<path_to_freshclam.conf> --datadir=/tmp/clamav-layer/clamav/defs -u $(id -u)
        # Or download manually:
        wget https://database.clamav.net/main.cvd -O /tmp/clamav-layer/clamav/defs/main.cvd
        wget https://database.clamav.net/daily.cvd -O /tmp/clamav-layer/clamav/defs/daily.cvd
        wget https://database.clamav.net/bytecode.cvd -O /tmp/clamav-layer/clamav/defs/bytecode.cvd
        ```

6.  **Package and Upload the Layer:**
    *   Navigate into your layer staging directory: `cd /tmp/clamav-layer`
    *   Create a .zip file of its contents: `zip -r9 ../clamav-layer.zip .`
    *   This `clamav-layer.zip` is what you will upload when creating the Lambda Layer in AWS.

7.  **Create the Lambda Layer in AWS:**
    *   Go to the AWS Lambda console -> Layers -> Create layer.
    *   Provide a name (e.g., `ClamAV-Custom`).
    *   Upload the `clamav-layer.zip` file.
    *   Select compatible runtimes (e.g., Node.js 18.x, Node.js 20.x) and architecture (`x86_64` or `arm64`, matching your build).
    *   Note the Layer ARN provided after creation.

**Note on Virus Definitions for the Layer:**
The initial virus definitions included in the layer will become outdated. A separate mechanism is required to update them (see Section 4).

*(These are general steps. Specific ClamAV versions or build configurations might require adjustments. Always refer to official ClamAV documentation.)*

### 3.2. Creating the IAM Role for Lambda

The Lambda function needs permissions to interact with S3 and CloudWatch Logs. We'll create an IAM policy with these permissions and then attach it to a new IAM role that the Lambda function will assume.

**1. Define the IAM Policy:**

Create a JSON file named `lambda-s3-clamav-scanner-policy.json` with the following content. **Remember to replace `YOUR_S3_BUCKET_NAME_HMNP` with your actual S3 bucket name.**

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObjectTagging",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::YOUR_S3_BUCKET_NAME_HMNP/*"
        }
    ]
}
```

**2. Create the IAM Role and Attach Policy:**

**Using AWS CLI:**

*   **Step 2a: Create the IAM Policy.**
    Replace `YOUR_S3_BUCKET_NAME_HMNP` in the `lambda-s3-clamav-scanner-policy.json` file first.
    ```bash
    aws iam create-policy \
        --policy-name S3ClamAVScannerLambdaPolicy \
        --policy-document file://lambda-s3-clamav-scanner-policy.json \
        --description "Policy for S3 ClamAV Scanner Lambda function to access S3 and CloudWatch Logs."
    ```
    Note the `Arn` of the policy from the output (e.g., `arn:aws:iam::YOUR_AWS_ACCOUNT_ID:policy/S3ClamAVScannerLambdaPolicy`). You'll need it in the next step.

*   **Step 2b: Create the IAM Role with a Trust Policy for Lambda.**
    Create a trust policy file, e.g., `lambda-trust-policy.json`:
    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "Service": "lambda.amazonaws.com"
          },
          "Action": "sts:AssumeRole"
        }
      ]
    }
    ```
    Then create the role:
    ```bash
    aws iam create-role \
        --role-name S3ClamAVScannerLambdaRole \
        --assume-role-policy-document file://lambda-trust-policy.json \
        --description "Role for S3 ClamAV Scanner Lambda function."
    ```
    Note the `Arn` of the role from the output.

*   **Step 2c: Attach the Policy to the Role.**
    Replace `YOUR_AWS_ACCOUNT_ID` with your actual AWS account ID.
    ```bash
    aws iam attach-role-policy \
        --role-name S3ClamAVScannerLambdaRole \
        --policy-arn arn:aws:iam::YOUR_AWS_ACCOUNT_ID:policy/S3ClamAVScannerLambdaPolicy
    ```

**Using AWS Management Console:**

1.  **Create the Policy:**
    *   Navigate to **IAM** in the AWS Console.
    *   Go to **Policies** and click **Create policy**.
    *   Select the **JSON** tab.
    *   Paste the content of `lambda-s3-clamav-scanner-policy.json` (remember to replace `YOUR_S3_BUCKET_NAME_HMNP`).
    *   Click **Next: Tags**, then **Next: Review**.
    *   Enter a **Name** (e.g., `S3ClamAVScannerLambdaPolicy`) and an optional description.
    *   Click **Create policy**.

2.  **Create the Role:**
    *   In IAM, go to **Roles** and click **Create role**.
    *   For **Trusted entity type**, select **AWS service**.
    *   For **Use case**, select **Lambda**.
    *   Click **Next**.
    *   In the **Add permissions** policies search box, find and select the policy you just created (e.g., `S3ClamAVScannerLambdaPolicy`).
    *   Click **Next**.
    *   Enter a **Role name** (e.g., `S3ClamAVScannerLambdaRole`) and an optional description.
    *   Click **Create role**.

After completing these steps, you will have an IAM Role (`S3ClamAVScannerLambdaRole`) that the Lambda function can assume, with the necessary permissions defined in `S3ClamAVScannerLambdaPolicy`. Make a note of the **Role ARN** as you will need it when creating the Lambda function.

### 3.3. Deploying the Lambda Function

This section details how to create the AWS Lambda function, configure it, and deploy your `index.mjs` code.

**Prerequisites:**
- You have the ARN for your custom ClamAV Lambda Layer (from step 3.1).
- You have the ARN for the `S3ClamAVScannerLambdaRole` (from step 3.2).
- Your `index.mjs` file is ready.

**1. Package your Lambda code:**

Create a .zip file containing your `index.mjs` file.
```bash
zip s3-clamav-scanner-lambda.zip index.mjs
```

**2. Deploy the Lambda Function:**

**Using AWS CLI:**

*   **Step 2a (Optional): Upload Lambda .zip package to S3.**
    If your .zip file is larger than what the CLI can directly handle or if you prefer to deploy from S3:
    ```bash
    aws s3 cp s3-clamav-scanner-lambda.zip s3://YOUR_LAMBDA_CODE_BUCKET/s3-clamav-scanner-lambda.zip
    ```
    Replace `YOUR_LAMBDA_CODE_BUCKET` with an S3 bucket you use for storing Lambda code.

*   **Step 2b: Create the Lambda function.**
    Replace the following placeholders:
    *   `YOUR_FUNCTION_NAME`: e.g., `S3ClamAVScanner`
    *   `YOUR_AWS_ACCOUNT_ID`: Your AWS Account ID.
    *   `YOUR_REGION`: The AWS region where you are deploying (e.g., `us-east-1`).
    *   `YOUR_LAMBDA_CODE_BUCKET`: (If deploying from S3) The S3 bucket from step 2a.
    *   `YOUR_CLAMAV_LAYER_ARN`: The ARN of your ClamAV Lambda Layer.
    *   `YOUR_IAM_ROLE_ARN`: The ARN of `S3ClamAVScannerLambdaRole` (e.g., `arn:aws:iam::YOUR_AWS_ACCOUNT_ID:role/S3ClamAVScannerLambdaRole`).
    *   `RUNTIME_VERSION`: e.g., `nodejs20.x` or `nodejs18.x`.
    *   `ARCHITECTURE`: e.g., `x86_64` or `arm64` (must match your ClamAV layer).

    **If deploying from local zip file:**
    ```bash
    aws lambda create-function \
        --function-name YOUR_FUNCTION_NAME \
        --runtime RUNTIME_VERSION \
        --architecture ARCHITECTURE \
        --role YOUR_IAM_ROLE_ARN \
        --handler index.handler \
        --zip-file fileb://s3-clamav-scanner-lambda.zip \
        --layers YOUR_CLAMAV_LAYER_ARN \
        --memory-size 1024 \
        --timeout 300 \
        --description "Scans S3 objects for viruses using ClamAV."
        # Optional: Add Environment Variables if your ClamAV layer paths differ from defaults
        # --environment "Variables={CLAMSCAN_PATH=/opt/custom_bin/clamscan,VIRUS_DEFS_PATH=/opt/custom_defs}"
    ```

    **If deploying from S3:**
    ```bash
    aws lambda create-function \
        --function-name YOUR_FUNCTION_NAME \
        --runtime RUNTIME_VERSION \
        --architecture ARCHITECTURE \
        --role YOUR_IAM_ROLE_ARN \
        --handler index.handler \
        --code S3Bucket=YOUR_LAMBDA_CODE_BUCKET,S3Key=s3-clamav-scanner-lambda.zip \
        --layers YOUR_CLAMAV_LAYER_ARN \
        --memory-size 1024 \
        --timeout 300 \
        --description "Scans S3 objects for viruses using ClamAV."
        # Optional: Add Environment Variables
        # --environment "Variables={CLAMSCAN_PATH=/opt/custom_bin/clamscan,VIRUS_DEFS_PATH=/opt/custom_defs}"
    ```

**Using AWS Management Console:**

1.  Navigate to **AWS Lambda** in the AWS Console.
2.  Click **Create function**.
3.  Select **Author from scratch**.
4.  **Function name:** Enter a name (e.g., `S3ClamAVScanner`).
5.  **Runtime:** Select your desired Node.js version (e.g., `Node.js 20.x`).
6.  **Architecture:** Select the architecture that matches your ClamAV layer (e.g., `x86_64` or `arm64`).
7.  **Permissions:**
    *   Expand **Change default execution role**.
    *   Select **Use an existing role**.
    *   From the **Existing role** dropdown, select `S3ClamAVScannerLambdaRole` (the role created in step 3.2).
8.  Click **Create function**.
9.  **Configure Code Source:**
    *   In the **Code source** section, click **Upload from**.
    *   Select **.zip file**.
    *   Click **Upload** and select your `s3-clamav-scanner-lambda.zip` file.
    *   Click **Save**.
10. **Configure Handler:**
    *   Under **Runtime settings**, click **Edit**.
    *   Ensure the **Handler** is set to `index.handler`.
    *   Click **Save**.
11. **Configure Layers:**
    *   In the **Layers** section at the bottom, click **Add a layer**.
    *   Select **Specify an ARN**.
    *   Paste the ARN of your ClamAV Lambda Layer.
    *   Click **Verify**. Once verified, click **Add**.
12. **Configure General Settings (Memory, Timeout):**
    *   Go to the **Configuration** tab, then **General configuration**.
    *   Click **Edit**.
    *   **Memory:** Set to at least **1024 MB**. Monitor and adjust as needed.
    *   **Timeout:** Set to **5 min 0 sec** (300 seconds). Monitor and adjust.
    *   Click **Save**.
13. **Configure Environment Variables (Optional):**
    *   If your ClamAV layer has binaries or definitions in paths different from the defaults in `index.mjs` (`/opt/clamav/bin/clamscan`, `/opt/clamav/defs`):
        *   Go to the **Configuration** tab, then **Environment variables**.
        *   Click **Edit**.
        *   Click **Add environment variable**.
        *   **Key:** `CLAMSCAN_PATH`, **Value:** `/your/layer/path/to/clamscan`
        *   **Key:** `VIRUS_DEFS_PATH`, **Value:** `/your/layer/path/to/definitions`
        *   Click **Save**.

After completing these steps, your Lambda function will be created and configured but not yet triggered by S3 events. That's covered in the next section.

### 3.4. Configuring S3 Event Notifications

This critical step links your S3 bucket to the `S3ClamAVScanner` Lambda function, so that new file uploads automatically trigger a virus scan.

**Prerequisites:**
- Your S3 bucket (e.g., `YOUR_S3_BUCKET_NAME_HMNP`) is created.
- Your Lambda function (`S3ClamAVScanner` or the name you chose) is deployed and you have its ARN.

**Configuration Details:**
- **Event Name:** A descriptive name (e.g., `ScanUploadedDocuments`).
- **Prefix (Recommended):** `client-uploads/` (ensures only files in this path trigger the scan).
- **Event Types:** `s3:ObjectCreated:*` (triggers on all object creation events like PUT, POST, Copy, MultipartUploadComplete).
- **Destination:** The `S3ClamAVScanner` Lambda function.

**Using AWS CLI:**

1.  **Add Permission to Lambda for S3 Invocation:**
    This command grants the S3 service principal permission to invoke your Lambda function. Replace placeholders:
    *   `YOUR_REGION`: e.g., `us-east-1`
    *   `YOUR_AWS_ACCOUNT_ID`: Your AWS Account ID.
    *   `YOUR_FUNCTION_NAME`: e.g., `S3ClamAVScanner`
    *   `YOUR_S3_BUCKET_NAME_HMNP`: Your S3 bucket name.

    ```bash
    aws lambda add-permission \
        --function-name YOUR_FUNCTION_NAME \
        --statement-id s3-invoke-permission-client-uploads \
        --action "lambda:InvokeFunction" \
        --principal s3.amazonaws.com \
        --source-arn arn:aws:s3:::YOUR_S3_BUCKET_NAME_HMNP \
        --source-account YOUR_AWS_ACCOUNT_ID \
        --region YOUR_REGION
    ```
    *Note: The `--source-arn` restricts which bucket can invoke this Lambda. You could make it more specific to a prefix if needed, but S3 event notifications themselves also specify the prefix.* 

2.  **Create S3 Bucket Notification Configuration:**
    Create a JSON file (e.g., `s3-notification-config.json`). Replace placeholders:
    *   `YOUR_LAMBDA_FUNCTION_ARN`: The full ARN of your `S3ClamAVScanner` Lambda function (e.g., `arn:aws:lambda:YOUR_REGION:YOUR_AWS_ACCOUNT_ID:function:YOUR_FUNCTION_NAME`).

    ```json
    {
      "LambdaFunctionConfigurations": [
        {
          "Id": "ScanClientUploadsEvent",
          "LambdaFunctionArn": "YOUR_LAMBDA_FUNCTION_ARN",
          "Events": ["s3:ObjectCreated:*"],
          "Filter": {
            "Key": {
              "FilterRules": [
                {
                  "Name": "prefix",
                  "Value": "client-uploads/"
                }
              ]
            }
          }
        }
      ]
    }
    ```

3.  **Apply the Notification Configuration to the S3 Bucket:**
    ```bash
    aws s3api put-bucket-notification-configuration \
        --bucket YOUR_S3_BUCKET_NAME_HMNP \
        --notification-configuration file://s3-notification-config.json
    ```

**Using AWS Management Console:**

1.  Navigate to **Amazon S3** in the AWS Console.
2.  Select your bucket (e.g., `YOUR_S3_BUCKET_NAME_HMNP`).
3.  Go to the **Properties** tab.
4.  Scroll down to **Event notifications** and click **Create event notification**.
5.  **Event name:** Enter a descriptive name (e.g., `ScanUploadedDocuments`).
6.  **Prefix (Optional):** Enter `client-uploads/` (ensure the trailing slash).
7.  **Suffix (Optional):** Leave blank unless you only want to scan specific file types by extension.
8.  **Event types:** Select **All object create events** (or expand and choose specific `PUT`, `POST`, `Copy`, `Complete multipart upload`).
9.  **Destination:**
    *   Select **Lambda function**.
    *   Choose your Lambda function from the dropdown (e.g., `S3ClamAVScanner`).
10. Click **Save changes**.
    *   The console usually handles adding the necessary `lambda:InvokeFunction` permission to your Lambda's resource-based policy automatically if it's missing. If it encounters an error, you might need to add it manually using the CLI command from step 1 above or via the Lambda console (Configuration -> Permissions -> Resource-based policy statements -> Add permission).

Once configured, any new file uploaded to the `client-uploads/` prefix in your S3 bucket will trigger the `S3ClamAVScanner` Lambda function.

## 4. ClamAV Virus Definition Updates

Virus definitions (`.cvd` files) must be kept current for ClamAV to be effective against new threats. Since you are building a custom ClamAV layer, you are responsible for this update process. A common and recommended approach is to use a separate, scheduled Lambda function.

**Strategy: Scheduled Lambda Function for Definition Updates**

This involves creating a new Lambda function (e.g., `ClamAVDefinitionUpdater`) that runs on a regular schedule (e.g., daily or every few hours) using an Amazon EventBridge (CloudWatch Events) trigger.

**Process for the `ClamAVDefinitionUpdater` Lambda:**

1.  **Prerequisites for this Updater Lambda:**
    *   It should use a layer that includes the `freshclam` binary and its necessary configuration (or have `freshclam` packaged with its code).
    *   It needs IAM permissions to:
        *   Publish new versions of your ClamAV Lambda Layer (`lambda:PublishLayerVersion`).
        *   (Optional, if storing definitions temporarily) Write to an S3 bucket or EFS.
        *   Write to CloudWatch Logs.

2.  **Lambda Execution Flow:**
    *   **Initialize `freshclam`:** Configure `freshclam.conf` if necessary (e.g., if not using default settings, though often defaults work).
    *   **Create a Writable Directory:** Lambda's `/tmp` space can be used to download new definitions.
    *   **Run `freshclam`:** Execute `freshclam` to download the latest `main.cvd`, `daily.cvd`, and `bytecode.cvd` files into the `/tmp` directory.
        ```bash
        # Example command within the Lambda if freshclam is in /opt/clamav/bin 
        # and defs are to be downloaded to /tmp/clamav_defs
        /opt/clamav/bin/freshclam --config-file=/opt/clamav/etc/freshclam.conf --datadir=/tmp/clamav_defs -u $(id -u)
        ```
        *Ensure `freshclam.conf` is correctly set up, or defaults are appropriate. The `-u $(id -u)` runs freshclam as the current user, which is needed in some environments.*
    *   **Package New Definitions:** Create a new .zip file containing the updated definition files. The structure of this zip should match the structure your `S3ClamAVScanner` Lambda expects for its `VIRUS_DEFS_PATH` (e.g., if it expects `/opt/clamav/defs`, then the zip should contain `clamav/defs/...`).
    *   **Publish New Layer Version:** Use the AWS SDK (e.g., `lambda.publishLayerVersion()`) within the updater Lambda to publish a new version of your ClamAV Lambda Layer, using the .zip file of new definitions as the content.
        *   Provide the existing ClamAV Layer name.
        *   Specify compatible runtimes and architecture.
    *   **(Optional) Update Scanning Lambda:** After a new layer version is published, you might want to automatically update your `S3ClamAVScanner` Lambda to use this new layer version. This can also be done via the AWS SDK (`lambda.updateFunctionConfiguration()`). Alternatively, you can manually update it or use features like Lambda Aliases and versions for more controlled rollouts.

**Considerations:**

*   **`freshclam` Configuration (`freshclam.conf`):** This file is key. It tells `freshclam` where to download definitions from, proxy settings, etc. It might need to be included in your ClamAV layer or created by the updater Lambda.
*   **Layer Size:** Virus definitions can grow. Ensure your new layer version doesn't exceed Lambda layer size limits (unzipped size contributes to the overall `/opt` limit).
*   **Frequency:** Running `freshclam` too frequently can lead to rate limiting by ClamAV mirrors. Once every few hours (e.g., 2-6 hours) is usually sufficient.
*   **Error Handling & Logging:** Implement robust error handling and logging in the `ClamAVDefinitionUpdater` Lambda to monitor its success.

**Manual Alternative (Less Ideal):**
Periodically (e.g., weekly) manually rebuild your entire ClamAV layer using the steps in Section 3.1, ensuring you download the latest definitions during that build process, and then manually update the `S3ClamAVScanner` Lambda to use the new layer version. This is less secure as definitions can become stale between manual updates.

## 5. Testing

After deploying the Lambda function and configuring S3 event notifications, thorough testing is essential to ensure the virus scanning process works correctly.

**Key areas to test:**
-   Processing of clean files.
-   Detection and handling of infected files.
-   Correct S3 object tagging.
-   Logging in CloudWatch.

**1. The EICAR Test File**

The EICAR (European Institute for Computer Antivirus Research) test file is a standard, **harmless** file used to test the functionality of antivirus software. It's a simple text file containing a specific string that all compliant AV software should detect as a virus.

*   **Content of the EICAR test file (save as `eicar.com`, `eicar.txt`, or similar):**
    ```text
    X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*
    ```
    You can create this file yourself using a text editor. Copy and paste the single line of text above into a new file.

**2. Testing Scenarios**

*   **Scenario 1: Uploading a Clean File**
    1.  **Action:** Upload a known clean file (e.g., a simple `.txt` or `.pdf` document that you are sure is virus-free) to your S3 bucket under the `client-uploads/` prefix.
        ```bash
        # Example using AWS CLI
        aws s3 cp my-clean-document.pdf s3://YOUR_S3_BUCKET_NAME_HMNP/client-uploads/my-clean-document.pdf
        ```
    2.  **Verification:**
        *   **S3 Object Tags:** After a short delay (allowing the Lambda to trigger and execute), check the tags of the uploaded S3 object. It should have a tag like `clamav-scan-status: clean`.
            ```bash
            aws s3api get-object-tagging --bucket YOUR_S3_BUCKET_NAME_HMNP --key client-uploads/my-clean-document.pdf
            ```
        *   **CloudWatch Logs:** Navigate to CloudWatch Logs for your `S3ClamAVScanner` Lambda function. Look for log entries indicating a successful scan and a 'clean' result for the file.

*   **Scenario 2: Uploading an Infected File (EICAR)**
    1.  **Action:** Upload the `eicar.com` (or `eicar.txt`) test file to your S3 bucket under the `client-uploads/` prefix.
        ```bash
        # Example using AWS CLI
        aws s3 cp eicar.com s3://YOUR_S3_BUCKET_NAME_HMNP/client-uploads/eicar.com
        ```
    2.  **Verification:**
        *   **S3 Object Behavior:** Based on the `index.mjs` logic, the infected file should be **deleted** from the S3 bucket. Verify that the `eicar.com` file no longer exists in `s3://YOUR_S3_BUCKET_NAME_HMNP/client-uploads/`.
            ```bash
            aws s3 ls s3://YOUR_S3_BUCKET_NAME_HMNP/client-uploads/
            ```
            (The EICAR file should not be listed if it was deleted).
            If your Lambda logic was to quarantine or tag instead of delete, verify that action.
        *   **CloudWatch Logs:** Check CloudWatch Logs for your `S3ClamAVScanner` Lambda. You should find log entries indicating that a virus (`EICAR-Test-Signature`) was detected and the corresponding action (e.g., file deletion) was taken.

**3. Checking CloudWatch Logs**

1.  Go to the AWS Management Console -> CloudWatch.
2.  In the left navigation pane, click on **Log groups**.
3.  Find and click on the log group for your Lambda function (e.g., `/aws/lambda/S3ClamAVScanner`).
4.  Select the latest log stream to view recent invocations.
5.  Look for messages like:
    *   `Scanning file: your-file-name.ext from bucket: YOUR_S3_BUCKET_NAME_HMNP`
    *   `Scan complete for: your-file-name.ext. Status: CLEAN`
    *   `VIRUS DETECTED in file: eicar.com. Name: EICAR-Test-Signature`
    *   `Infected file eicar.com deleted successfully from bucket YOUR_S3_BUCKET_NAME_HMNP.`
    *   Any error messages if scans fail or other issues occur.

Repeat these tests with various file types and sizes (within your configured limits) to ensure consistent behavior.

## 6. Monitoring and Logging

Effective monitoring and logging are crucial for maintaining the health, performance, and security of your `S3ClamAVScanner` Lambda function.

**1. AWS CloudWatch Metrics**

AWS Lambda automatically sends metrics to CloudWatch. Monitor these key metrics for your `S3ClamAVScanner` function in the CloudWatch console:

*   **Invocations:** The number of times your Lambda function is invoked. A sudden drop or spike might indicate issues with S3 event notifications or upstream processes.
*   **Errors:** The number of invocations that result in an error. This includes function errors (exceptions in your code) and invocation errors (e.g., due to timeouts or misconfiguration).
*   **Duration:** The average, maximum, and minimum time your function takes to execute. Consistently high duration might indicate performance bottlenecks or issues with ClamAV scanning time, potentially requiring memory increases or timeout adjustments.
*   **Throttles:** The number of times invocations are throttled because the concurrent execution limit for your account/region or function was reached. Consistent throttling may require requesting a concurrency limit increase.
*   **ConcurrentExecutions:** The number of function instances processing events simultaneously. Useful for understanding usage patterns.

**2. AWS CloudWatch Logs**

*   All `console.log()`, `console.error()`, etc., statements from your `index.mjs` code are sent to CloudWatch Logs.
*   Log streams are created for each instance of your Lambda function.
*   **Accessing Logs:** In the AWS Lambda console, select your function, go to the **Monitor** tab, and click **View logs in CloudWatch**. Alternatively, navigate directly to CloudWatch Log groups.
*   **Uses:**
    *   Troubleshooting errors and exceptions.
    *   Verifying successful scans and actions taken (clean, infected, deleted).
    *   Tracking the processing of specific S3 objects.
    *   Understanding the execution flow of your Lambda.

**3. AWS CloudWatch Alarms**

Set up CloudWatch Alarms based on the metrics above to be proactively notified of potential issues:

*   **High Error Rate:** Create an alarm if the `Errors` metric exceeds a certain threshold over a defined period (e.g., >5 errors in 5 minutes or >1% error rate).
*   **Excessive Duration:** Alarm if the `Duration` (average or p95/p99) consistently exceeds a significant portion of your configured timeout (e.g., >80% of timeout).
*   **Throttling:** Alarm if the `Throttles` metric shows any activity, as this indicates your function couldn't scale to meet demand.
*   **Dead Letter Queue (DLQ) Alarms:** If you configure a DLQ for your Lambda (recommended for critical asynchronous processes), set an alarm on the number of messages in the DLQ.

**To create an alarm:**
1.  Go to CloudWatch -> Alarms.
2.  Click **Create alarm**.
3.  Select metric, choose your Lambda function, set conditions, and configure notifications (e.g., to an SNS topic that sends emails or SMS).

**4. AWS X-Ray (Optional - Advanced Tracing)**

For more in-depth performance analysis and tracing requests as they flow through your Lambda function and interact with other AWS services (like S3):

*   Enable AWS X-Ray active tracing in your Lambda function's configuration (Configuration -> Monitoring and operations tools -> AWS X-Ray -> Active tracing).
*   This requires the AWS X-Ray SDK to be included if you want to add custom subsegments or annotations in your Node.js code, but basic tracing of SDK calls (like to S3) can often be captured automatically.
*   X-Ray helps identify performance bottlenecks, visualize service maps, and understand the latency contributions of different parts of your function's execution.

By utilizing these CloudWatch features, you can gain visibility into your Lambda function's operation and respond quickly to any problems.

## 7. Troubleshooting

This section covers common issues you might encounter and how to address them.

**1. Lambda Function Timeouts:**
*   **Symptom:** Lambda invocations fail with a timeout error in CloudWatch Logs.
*   **Cause:** ClamAV scanning, especially for larger files or on first invocation (cold start with definition loading), can be time-consuming. The default Lambda timeout might be too short.
*   **Resolution:**
    *   Increase the Lambda function's **Timeout** setting (e.g., to 5-10 minutes, monitor and adjust). See Section 3.3.
    *   Increase the Lambda function's **Memory**. More memory often provides more CPU power, potentially speeding up scans. (e.g., 1024MB, 2048MB, or higher).
    *   Ensure your `index.mjs` `CLAMAV_TIMEOUT_SECONDS` is less than the overall Lambda timeout to allow `clamscan` to finish or be killed gracefully.

**2. ClamAV Errors (e.g., 'clamscan: command not found', 'Can't open file or directory ERROR'):**
*   **Symptom:** CloudWatch Logs show errors from the `clamscan` execution, or errors indicating ClamAV components are missing.
*   **Cause:**
    *   Incorrect paths to ClamAV binaries (`CLAMSCAN_PATH`) or definitions (`VIRUS_DEFS_PATH`) in `index.mjs` or environment variables.
    *   ClamAV binaries or definition files are not correctly packaged in your Lambda Layer, or the layer structure is not as expected by the Lambda function.
    *   The Lambda Layer is not attached to the function, or the wrong layer version is attached.
*   **Resolution:**
    *   Verify the `CLAMSCAN_PATH` and `VIRUS_DEFS_PATH` in your `index.mjs` (or environment variables) correctly point to the locations within the `/opt` directory where your layer unpacks these files.
    *   Inspect your ClamAV Lambda Layer .zip file. Unzip it locally and verify the directory structure (e.g., `bin/clamscan`, `share/clamav/...` or your custom structure).
    *   Ensure the ClamAV layer is correctly attached to your Lambda function and is the intended version.
    *   Check permissions on the ClamAV binaries within the layer; they must be executable.

**3. IAM Permission Issues:**
*   **Symptom:** Lambda fails with 'Access Denied' errors when trying to get/put S3 objects, get/put S3 tags, or delete S3 objects. CloudWatch Logs might show `AccessDeniedException`.
*   **Cause:** The IAM Role (`S3ClamAVScannerLambdaRole`) attached to the Lambda function lacks the necessary permissions.
*   **Resolution:** Review the IAM policy (`lambda-s3-clamav-scanner-policy.json` described in Section 3.2). Ensure it grants:
    *   `s3:GetObject`, `s3:GetObjectTagging` for the source bucket.
    *   `s3:PutObjectTagging` for the source bucket (to tag files as clean/infected).
    *   `s3:DeleteObject` for the source bucket (if deleting infected files).
    *   `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents` for CloudWatch Logs.

**4. S3 Event Notifications Not Triggering Lambda:**
*   **Symptom:** Files uploaded to S3 do not trigger the Lambda function; no new invocations appear in CloudWatch Metrics or Logs.
*   **Cause:**
    *   S3 event notification is not configured, or configured incorrectly.
    *   Incorrect prefix/suffix filters in the S3 event notification settings.
    *   S3 service does not have permission to invoke the Lambda function.
*   **Resolution:**
    *   Verify S3 event notification settings (Section 3.4). Check the bucket, prefix (`client-uploads/`), and event type (`s3:ObjectCreated:*`).
    *   Ensure the Lambda function specified as the destination is correct.
    *   Check the Lambda function's resource-based policy. It must grant `s3.amazonaws.com` permission to invoke the function. The `aws lambda add-permission` command in Section 3.4 (or the console setup) should handle this. If in doubt, re-apply the permission.

**5. `freshclam` Failures (in Definition Updater Lambda - Section 4):**
*   **Symptom:** The scheduled `ClamAVDefinitionUpdater` Lambda fails, or virus definitions are not being updated.
*   **Cause:**
    *   `freshclam` cannot connect to definition mirrors (network issue, DNS, proxy misconfiguration).
    *   Updater Lambda lacks permissions to download files (if from an interim S3 location) or to publish a new Lambda Layer version.
    *   `freshclam.conf` is misconfigured or missing.
    *   Not enough disk space in `/tmp` for downloaded definitions (less common for just definitions, but possible).
*   **Resolution:**
    *   Check CloudWatch Logs for the `ClamAVDefinitionUpdater` Lambda for specific `freshclam` error messages.
    *   Ensure the Lambda has internet access (e.g., via a NAT Gateway if in a VPC without public IPs).
    *   Verify the IAM role for the updater Lambda has `lambda:PublishLayerVersion` permission for the target ClamAV layer.
    *   Ensure `freshclam.conf` is present and correctly configured in the updater's layer/package.

**6. Infected Files Not Deleted / Clean Files Not Tagged:**
*   **Symptom:** Lambda runs, logs show scan results, but the expected S3 action (delete/tag) doesn't happen, or the wrong action occurs.
*   **Cause:** Logic error in `index.mjs` for handling scan results or interacting with S3.
*   **Resolution:**
    *   Carefully review the `if (scanResult.isInfected)` block in `index.mjs`.
    *   Verify S3 client calls (`DeleteObjectCommand`, `PutObjectTaggingCommand`) have correct parameters (Bucket, Key, TagSet).
    *   Add more detailed logging around these actions to trace the logic flow.

Always check CloudWatch Logs first, as they usually provide the most direct clues to the root cause of an issue.

## 8. Conclusion

This document provides a comprehensive guide to deploying an S3-triggered AWS Lambda function for scanning uploaded files using ClamAV. By following these steps, you can implement a robust serverless solution to enhance the security of your file upload workflow, helping to protect your systems and users from malware.

The key components of this solution include:
-   **AWS S3:** For storing uploaded files and triggering scans.
-   **AWS Lambda:** For hosting the serverless scanning logic (`index.mjs`).
-   **ClamAV:** The open-source antivirus engine performing the scans, packaged in a Lambda Layer.
-   **AWS IAM:** For securely managing permissions for the Lambda function.
-   **AWS CloudWatch (Logs, Metrics, Alarms):** For monitoring, logging, and alerting.

Regularly updating ClamAV virus definitions (as outlined in Section 4) and monitoring the system (Section 6) are crucial for maintaining its effectiveness. This setup provides a scalable and cost-effective way to integrate virus scanning into your cloud environment.
