#!/usr/bin/env node
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const settings = [
  { key: 'business.baseLocation', value: '77591', dataType: 'string', description: 'Primary business ZIP for distance calculations', category: 'location' },
  { key: 'business.baseLocationFull', value: 'Texas City, TX 77591', dataType: 'string', description: 'Full address for distance matrix origin', category: 'location' },
  { key: 'mileage.freeServiceRadius', value: '20', dataType: 'number', description: '20-mile included radius for Standard Mobile Notary', category: 'mileage' },
  { key: 'mileage.maxServiceRadius', value: '50', dataType: 'number', description: 'Maximum service radius (miles)', category: 'mileage' },
  { key: 'pricing.travelFeeMode', value: 'tiered', dataType: 'string', description: 'Use tiered travel zones instead of per-mile', category: 'pricing' },
  { key: 'pricing.travelFeeTiers', value: JSON.stringify([{ maxMiles: 20, fee: 0 }, { maxMiles: 30, fee: 25 }, { maxMiles: 40, fee: 45 }, { maxMiles: 50, fee: 65 }]), dataType: 'json', description: 'Tiered travel zones from 77591', category: 'pricing' },
  { key: 'pricing.loanSigning.eveningWeekendFee', value: '25', dataType: 'number', description: 'Flat fee for evening/weekend loan signings', category: 'pricing' },
  { key: 'pricing.ron.afterHoursStart', value: '21:00', dataType: 'string', description: 'After-hours start time for RON convenience fee', category: 'pricing' },
  { key: 'pricing.ron.afterHoursFee', value: '10', dataType: 'number', description: 'RON convenience fee after 9pm', category: 'pricing' }
]

async function main() {
  console.log('🔧 Upserting BusinessSettings...')
  for (const s of settings) {
    await prisma.businessSettings.upsert({
      where: { key: s.key },
      update: { value: s.value, dataType: s.dataType, description: s.description, category: s.category, updatedAt: new Date() },
      create: s
    })
    console.log(`   • ${s.key} = ${s.value}`)
  }
  console.log('✅ BusinessSettings upsert complete')
}

main().catch(err => {
  console.error('❌ Upsert failed:', err)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})


