import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Role } from '@prisma/client'
import { 
  sendPushNotificationToUser, 
  sendPushNotificationToUsers,
  BookingNotifications,
  SystemNotifications,
  PushNotificationPayload 
} from '@/lib/push-notifications/sender'

interface SendNotificationRequest {
  type: 'single' | 'multiple' | 'booking' | 'system'
  userIds?: string[]
  userId?: string
  bookingId?: string
  notificationType?: string
  customPayload?: PushNotificationPayload
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check admin authorization
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const body: SendNotificationRequest = await request.json()
    const { type, userIds, userId, bookingId, notificationType, customPayload } = body

    let result

    switch (type) {
      case 'single':
        if (!userId || !customPayload) {
          return NextResponse.json(
            { error: 'userId and customPayload are required for single notifications' },
            { status: 400 }
          )
        }
        result = await sendPushNotificationToUser(userId, customPayload)
        break

      case 'multiple':
        if (!userIds || !customPayload) {
          return NextResponse.json(
            { error: 'userIds and customPayload are required for multiple notifications' },
            { status: 400 }
          )
        }
        result = await sendPushNotificationToUsers(userIds, customPayload)
        break

      case 'booking':
        if (!userId || !bookingId || !notificationType) {
          return NextResponse.json(
            { error: 'userId, bookingId, and notificationType are required for booking notifications' },
            { status: 400 }
          )
        }
        
        switch (notificationType) {
          case 'confirmation':
            result = await BookingNotifications.confirmationNotification(userId, bookingId)
            break
          case 'reminder':
            result = await BookingNotifications.reminderNotification(userId, bookingId, '1 hour')
            break
          case 'completion':
            result = await BookingNotifications.completionNotification(userId, bookingId)
            break
          case 'document-ready':
            result = await BookingNotifications.documentReadyNotification(userId, bookingId)
            break
          default:
            return NextResponse.json(
              { error: 'Invalid booking notification type' },
              { status: 400 }
            )
        }
        break

      case 'system':
        if (!userId || !notificationType) {
          return NextResponse.json(
            { error: 'userId and notificationType are required for system notifications' },
            { status: 400 }
          )
        }
        
        switch (notificationType) {
          case 'maintenance':
            result = await SystemNotifications.maintenanceNotification(userId)
            break
          case 'new-feature':
            result = await SystemNotifications.newFeatureNotification(userId, 'Enhanced Booking')
            break
          default:
            return NextResponse.json(
              { error: 'Invalid system notification type' },
              { status: 400 }
            )
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Admin notification send error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

// GET endpoint to test notification functionality
export async function GET() {
  return NextResponse.json({
    message: 'Admin Notification API',
    endpoints: {
      POST: {
        description: 'Send push notifications',
        examples: {
          single: {
            type: 'single',
            userId: 'user-id',
            customPayload: {
              title: 'Hello!',
              body: 'This is a test notification',
              url: '/dashboard'
            }
          },
          booking: {
            type: 'booking',
            userId: 'user-id',
            bookingId: 'booking-id',
            notificationType: 'confirmation'
          },
          system: {
            type: 'system',
            userId: 'user-id',
            notificationType: 'maintenance'
          }
        }
      }
    }
  })
} 