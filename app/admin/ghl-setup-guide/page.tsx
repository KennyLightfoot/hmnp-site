export default function GHLSetupGuidePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-oxford-blue">GoHighLevel Private Integration Setup Guide</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-oxford-blue">Step 1: Create a Private Integration</h2>
        <ol className="list-decimal pl-5 space-y-4">
          <li className="text-lg">
            <p>Log in to your GoHighLevel account</p>
          </li>
          <li className="text-lg">
            <p>
              Navigate to <strong>Settings &gt; Integrations</strong>
            </p>
            <img
              src="/placeholder.svg?height=200&width=400"
              alt="GoHighLevel Settings Menu"
              className="my-2 rounded border"
            />
          </li>
          <li className="text-lg">
            <p>
              Click on <strong>Create New Integration</strong>
            </p>
          </li>
          <li className="text-lg">
            <p>Fill in the integration details:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                Name: <strong>HMNP Website Integration</strong>
              </li>
              <li>
                Description: <strong>Integration for the HMNP website</strong>
              </li>
              <li>
                Website URL: <strong>Your website URL</strong>
              </li>
              <li>
                Redirect URL: <strong>Leave blank for Private Integration</strong>
              </li>
            </ul>
          </li>
        </ol>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-oxford-blue">Step 2: Select Required Scopes</h2>
        <p className="mb-4 text-lg">Select the following scopes (permissions) for your integration:</p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="border rounded-md p-3 bg-gray-50">
            <h3 className="font-medium mb-2">Contacts</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>contacts.readonly</li>
              <li>contacts.write</li>
            </ul>
          </div>

          <div className="border rounded-md p-3 bg-gray-50">
            <h3 className="font-medium mb-2">Calendars</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>calendars.readonly</li>
              <li>calendars.write</li>
              <li>appointments.readonly</li>
              <li>appointments.write</li>
            </ul>
          </div>

          <div className="border rounded-md p-3 bg-gray-50">
            <h3 className="font-medium mb-2">Workflows</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>workflows.readonly</li>
              <li>workflows.write</li>
              <li>workflows.execute</li>
            </ul>
          </div>

          <div className="border rounded-md p-3 bg-gray-50">
            <h3 className="font-medium mb-2">Locations</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>locations.readonly</li>
            </ul>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <p className="font-medium text-yellow-800">Important:</p>
          <p className="text-yellow-700">
            Select all scopes that your application will need. You can always update these later if needed.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-oxford-blue">Step 3: Generate Private Integration Token</h2>
        <ol className="list-decimal pl-5 space-y-4">
          <li className="text-lg">
            <p>
              After selecting the required scopes, click <strong>Create Integration</strong>
            </p>
          </li>
          <li className="text-lg">
            <p>
              On the next screen, click <strong>Generate Token</strong>
            </p>
            <img
              src="/placeholder.svg?height=200&width=400"
              alt="Generate Token Button"
              className="my-2 rounded border"
            />
          </li>
          <li className="text-lg">
            <p>Copy the generated Private Integration Token (PIT)</p>
            <div className="bg-gray-100 p-3 rounded my-2 font-mono text-sm">
              pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
            </div>
            <p className="text-red-600 font-medium">
              Important: Save this token securely. You won't be able to see it again!
            </p>
          </li>
        </ol>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-oxford-blue">Step 4: Update Environment Variables</h2>
        <ol className="list-decimal pl-5 space-y-4">
          <li className="text-lg">
            <p>Go to your Vercel project dashboard</p>
          </li>
          <li className="text-lg">
            <p>
              Navigate to <strong>Settings &gt; Environment Variables</strong>
            </p>
          </li>
          <li className="text-lg">
            <p>
              Update the <strong>GHL_API_KEY</strong> environment variable with your new Private Integration Token
            </p>
            <div className="grid grid-cols-2 gap-4 my-2">
              <div className="font-medium">Name</div>
              <div className="font-medium">Value</div>
              <div>GHL_API_KEY</div>
              <div className="font-mono text-sm">pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</div>
            </div>
          </li>
          <li className="text-lg">
            <p>Add the API base URL if not already set</p>
            <div className="grid grid-cols-2 gap-4 my-2">
              <div className="font-medium">Name</div>
              <div className="font-medium">Value</div>
              <div>GHL_API_BASE_URL</div>
              <div className="font-mono text-sm">https://services.leadconnectorhq.com</div>
            </div>
          </li>
          <li className="text-lg">
            <p>
              Click <strong>Save</strong> and redeploy your application
            </p>
          </li>
        </ol>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-oxford-blue">Step 5: Update API Request Headers</h2>
        <p className="mb-4 text-lg">Make sure your API requests include the correct headers:</p>

        <div className="bg-gray-100 p-4 rounded my-2 font-mono text-sm overflow-x-auto">
          {`// Example API request
const response = await fetch('https://services.leadconnectorhq.com/contacts', {
  headers: {
    'Authorization': process.env.GHL_API_KEY,
    'Version': '2021-07-28',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});`}
        </div>

        <div className="mt-4">
          <h3 className="font-medium mb-2">Required Headers:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Authorization</strong>: Your Private Integration Token (no "Bearer" prefix needed)
            </li>
            <li>
              <strong>Version</strong>: 2021-07-28 (or the latest API version)
            </li>
            <li>
              <strong>Accept</strong>: application/json
            </li>
            <li>
              <strong>Content-Type</strong>: application/json (for POST/PUT requests)
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-oxford-blue">Step 6: Test Your Integration</h2>
        <p className="mb-4 text-lg">
          After setting up your Private Integration Token and updating your environment variables, test your
          integration:
        </p>

        <ol className="list-decimal pl-5 space-y-4">
          <li className="text-lg">
            <p>
              Go to{" "}
              <a href="/admin/ghl-enhanced-diagnostic" className="text-blue-600 hover:underline">
                GoHighLevel Enhanced Diagnostic
              </a>{" "}
              page
            </p>
          </li>
          <li className="text-lg">
            <p>
              Click <strong>Run Diagnostics</strong> to test your integration
            </p>
          </li>
          <li className="text-lg">
            <p>Check the results to ensure your integration is working properly</p>
          </li>
        </ol>

        <div className="bg-green-50 border border-green-200 rounded-md p-4 mt-6">
          <p className="font-medium text-green-800">Success Criteria:</p>
          <p className="text-green-700">
            Your integration is working correctly if at least one of the endpoints returns a successful response (200
            OK).
          </p>
        </div>
      </div>
    </div>
  )
}

