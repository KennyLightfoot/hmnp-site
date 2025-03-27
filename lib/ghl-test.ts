"use server"

import { getContact, createContact, getCustomFields, getTags, getCalendars } from "./gohighlevel"

export async function testGhlConnection() {
  try {
    // Test creating a contact
    const testContact = await createContact({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      phone: "5555555555",
      tags: ["API Test"],
      customFields: {
        source: "API Test",
        submittedAt: new Date().toISOString(),
      },
    })

    console.log("Test contact created:", testContact)

    // Test retrieving the contact
    if (testContact.id) {
      const retrievedContact = await getContact(testContact.id)
      console.log("Retrieved contact:", retrievedContact)
    }

    return {
      success: true,
      message: "GoHighLevel API connection test successful",
      contactId: testContact.id,
    }
  } catch (error) {
    console.error("GoHighLevel API connection test failed:", error)
    return {
      success: false,
      message: `GoHighLevel API connection test failed: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function getGhlCustomFields() {
  try {
    const customFields = await getCustomFields()
    return {
      success: true,
      customFields,
    }
  } catch (error) {
    console.error("Failed to get custom fields:", error)
    return {
      success: false,
      message: `Failed to get custom fields: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function getGhlTags() {
  try {
    const tags = await getTags()
    return {
      success: true,
      tags,
    }
  } catch (error) {
    console.error("Failed to get tags:", error)
    return {
      success: false,
      message: `Failed to get tags: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

export async function getGhlCalendars() {
  try {
    const calendars = await getCalendars()
    return {
      success: true,
      calendars,
    }
  } catch (error) {
    console.error("Failed to get calendars:", error)
    return {
      success: false,
      message: `Failed to get calendars: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

