import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET business settings - for fetching calendar settings
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    
    // Prepare filter
    const filter = category ? { where: { category } } : {};
    
    // Get settings
    const settings = await prisma.businessSettings.findMany({
      ...filter,
      orderBy: { key: "asc" }
    });
    
    // Convert to structured format by category
    const structuredSettings = {};
    
    settings.forEach(setting => {
      const category = setting.category || "general";
      
      if (!structuredSettings[category]) {
        structuredSettings[category] = {};
      }
      
      // Convert value based on dataType
      let value = setting.value;
      if (setting.dataType === "number") {
        value = parseFloat(setting.value);
      } else if (setting.dataType === "boolean") {
        value = setting.value === "true";
      } else if (setting.dataType === "json") {
        try {
          value = JSON.parse(setting.value);
        } catch (e) {
          console.warn(`Failed to parse JSON setting ${setting.key}`, e);
        }
      }
      
      structuredSettings[category][setting.key] = value;
    });
    
    return NextResponse.json({
      success: true,
      settings: structuredSettings,
      metadata: {
        timestamp: new Date().toISOString(),
        filter: category ? { category } : "all"
      }
    });
    
  } catch (error) {
    console.error("Error getting business settings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to get business settings"
      },
      { status: 500 }
    );
  }
}

// POST business settings - for saving calendar settings
export async function POST(request) {
  try {
    const body = await request.json();
    const { settings } = body;
    
    if (!Array.isArray(settings)) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: [{ msg: "Settings must be an array" }]
        },
        { status: 400 }
      );
    }
    
    // Process each setting
    const results = await Promise.all(settings.map(async (setting) => {
      const { key, value, dataType, category } = setting;
      
      if (!key || !value || !dataType || !category) {
        throw new Error(`Invalid setting: ${JSON.stringify(setting)}`);
      }

      // Check if setting already exists
      const existingSetting = await prisma.businessSettings.findFirst({
        where: { key }
      });

      if (existingSetting) {
        // Update existing setting
        return await prisma.businessSettings.update({
          where: { id: existingSetting.id },
          data: {
            value,
            dataType,
            category,
            updatedAt: new Date()
          }
        });
      } else {
        // Create new setting
        return await prisma.businessSettings.create({
          data: {
            key,
            value,
            dataType,
            category
          }
        });
      }
    }));

    return NextResponse.json({
      success: true,
      message: "Business settings updated successfully",
      updatedSettings: results.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("Error updating business settings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to update business settings"
      },
      { status: 500 }
    );
  }
}
