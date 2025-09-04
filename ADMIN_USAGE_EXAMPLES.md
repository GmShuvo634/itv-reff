# Admin System Usage Examples

This document provides practical examples of how to use the new admin functionality including audit logging, notifications, and file uploads.

## Table of Contents

1. [Audit Logging Examples](#audit-logging-examples)
2. [Notification System Examples](#notification-system-examples)
3. [File Upload Examples](#file-upload-examples)
4. [Integration with Existing Services](#integration-with-existing-services)
5. [API Usage Examples](#api-usage-examples)

## Audit Logging Examples

### Basic Audit Logging

```typescript
import { auditService, AuditAction } from "@/lib/admin/audit-service";

// Log a user update action
await auditService.logUserAction(
  adminId,
  AuditAction.USER_UPDATED,
  userId,
  "Updated user profile information",
  {
    changes: { name: "New Name", email: "new@example.com" },
    previousValues: { name: "Old Name", email: "old@example.com" }
  },
  "192.168.1.1",
  "Mozilla/5.0..."
);

// Log admin login
await auditService.logAdminLogin(
  adminId,
  "192.168.1.1",
  "Mozilla/5.0..."
);

// Log video management action
await auditService.logVideoAction(
  adminId,
  AuditAction.VIDEO_CREATED,
  videoId,
  "Created new video: Sample Video Title",
  {
    videoTitle: "Sample Video Title",
    duration: 120,
    rewardAmount: 5.00
  },
  "192.168.1.1"
);
```

### Query Audit Logs

```typescript
// Get paginated audit logs with filters
const auditLogs = await auditService.getAuditLogs({
  adminId: "specific-admin-id",
  action: AuditAction.USER_UPDATED,
  dateFrom: new Date("2024-01-01"),
  dateTo: new Date("2024-12-31")
}, 1, 20);

// Get audit logs for a specific target
const userAuditLogs = await auditService.getTargetAuditLogs(
  "user",
  userId,
  10
);

// Get admin activity summary
const adminActivity = await auditService.getAdminActivity(
  adminId,
  new Date("2024-01-01"),
  new Date("2024-12-31")
);

console.log(`Admin performed ${adminActivity.totalActions} actions`);
console.log("Actions by type:", adminActivity.actionsByType);
```

### Export and Cleanup

```typescript
// Export audit logs as CSV
const csvData = await auditService.exportAuditLogs({
  dateFrom: new Date("2024-01-01"),
  dateTo: new Date("2024-12-31")
});

// Clean up old logs (older than 365 days)
const deletedCount = await auditService.cleanupOldLogs(365);
console.log(`Deleted ${deletedCount} old audit logs`);
```

## Notification System Examples

### Create Notifications

```typescript
import { 
  notificationService, 
  NotificationType, 
  NotificationSeverity 
} from "@/lib/admin/notification-service";

// User registration notification
await notificationService.notifyUserRegistration(
  userId,
  "John Doe",
  "john@example.com"
);

// Withdrawal request notification
await notificationService.notifyWithdrawalRequest(
  withdrawalId,
  userId,
  100.00,
  "John Doe"
);

// Custom system alert
await notificationService.notifySystemAlert(
  "Database Maintenance",
  "Scheduled maintenance will begin in 30 minutes",
  NotificationSeverity.WARNING,
  "/admin/maintenance",
  { scheduledTime: new Date("2024-03-15T02:00:00Z") }
);

// Security alert
await notificationService.notifySecurityAlert(
  "Suspicious Login Attempt",
  "Multiple failed login attempts detected from IP: 192.168.1.100",
  userId,
  { ipAddress: "192.168.1.100", attemptCount: 5 }
);
```

### Query and Manage Notifications

```typescript
// Get paginated notifications
const notifications = await notificationService.getNotifications({
  type: NotificationType.WITHDRAWAL_REQUEST,
  isRead: false,
  severity: NotificationSeverity.WARNING
}, 1, 20);

console.log(`Found ${notifications.unreadCount} unread notifications`);

// Mark notifications as read
await notificationService.markMultipleAsRead([
  "notification-id-1",
  "notification-id-2"
]);

// Mark all notifications as read for admin
await notificationService.markAllAsReadForTarget("admin", adminId);

// Get notification statistics
const stats = await notificationService.getNotificationStats(
  new Date("2024-01-01"),
  new Date("2024-12-31")
);

console.log("Notification stats:", {
  total: stats.totalNotifications,
  unread: stats.unreadNotifications,
  byType: stats.notificationsByType,
  bySeverity: stats.notificationsBySeverity
});
```

### Bulk Operations

```typescript
// Create multiple notifications at once
await notificationService.createBulkNotifications([
  {
    type: NotificationType.SYSTEM_ALERT,
    title: "System Update",
    message: "System will be updated tonight",
    severity: NotificationSeverity.INFO
  },
  {
    type: NotificationType.MAINTENANCE,
    title: "Scheduled Maintenance",
    message: "Database maintenance scheduled",
    severity: NotificationSeverity.WARNING,
    metadata: { duration: "2 hours" }
  }
]);

// Clean up old notifications (older than 90 days)
const deletedCount = await notificationService.cleanupOldNotifications(90);
console.log(`Cleaned up ${deletedCount} old notifications`);
```

## File Upload Examples

### Upload Files

```typescript
import { fileUploadService, FileUploadType } from "@/lib/admin/file-upload-service";

// Upload a video file
const videoUpload = await fileUploadService.uploadFile(
  videoFile, // File or Buffer
  "sample-video.mp4",
  FileUploadType.VIDEO,
  adminId,
  {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: [".mp4", ".avi", ".mov"],
    generateThumbnail: true,
    processVideo: true
  }
);

if (videoUpload.success) {
  console.log("Video uploaded:", videoUpload.file?.id);
  console.log("File URL:", fileUploadService.getFileUrl(videoUpload.file!.filePath));
} else {
  console.error("Upload failed:", videoUpload.error);
}

// Upload an avatar
const avatarUpload = await fileUploadService.uploadFile(
  avatarFile,
  "user-avatar.jpg",
  FileUploadType.AVATAR,
  adminId,
  {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: [".jpg", ".jpeg", ".png"]
  }
);
```

### Manage Uploaded Files

```typescript
// Get paginated file uploads
const files = await fileUploadService.getFileUploads({
  uploadType: FileUploadType.VIDEO,
  isProcessed: true,
  uploadedBy: adminId
}, 1, 20);

console.log(`Found ${files.totalCount} files`);

// Get file by ID
const file = await fileUploadService.getFileById(fileId);
if (file) {
  console.log("File details:", {
    originalName: file.originalName,
    size: `${(file.fileSize / 1024 / 1024).toFixed(2)} MB`,
    uploadDate: file.createdAt,
    isProcessed: file.isProcessed,
    url: fileUploadService.getFileUrl(file.filePath)
  });
}

// Update file processing status
await fileUploadService.updateProcessingStatus(
  fileId,
  "completed",
  { 
    duration: 120, 
    resolution: "1920x1080",
    thumbnailGenerated: true 
  }
);

// Delete file
const deleted = await fileUploadService.deleteFile(fileId);
console.log("File deleted:", deleted);
```

### File Statistics and Cleanup

```typescript
// Get file statistics
const stats = await fileUploadService.getFileStatistics();
console.log("File statistics:", {
  total: stats.totalFiles,
  totalSize: `${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`,
  processing: stats.processingFiles,
  failed: stats.failedFiles,
  byType: stats.filesByType
});

// Clean up orphaned files
const cleanedUp = await fileUploadService.cleanupOrphanedFiles();
console.log(`Cleaned up ${cleanedUp} orphaned files`);
```

## Integration with Existing Services

### Enhanced User Management with Audit Trail

```typescript
import { userManagementService } from "@/lib/admin/user-management-service";

// Update user with audit logging
const updatedUser = await userManagementService.updateUser(
  userId,
  {
    name: "New Name",
    status: UserStatus.ACTIVE
  },
  adminId, // This enables audit logging
  "192.168.1.1",
  "Mozilla/5.0..."
);

// Update user status with audit trail
await userManagementService.updateUserStatus(
  userId,
  UserStatus.SUSPENDED,
  "Suspended for policy violation",
  adminId,
  "192.168.1.1",
  "Mozilla/5.0..."
);

// Update wallet balance with audit trail
await userManagementService.updateWalletBalance(
  userId,
  150.00,
  "Admin adjustment for compensation",
  adminId,
  "192.168.1.1",
  "Mozilla/5.0..."
);
```

### Video Management with Notifications

```typescript
// When a new video is uploaded, create notification and log audit
async function handleVideoUpload(videoData: any, adminId: string) {
  try {
    // Create video (your existing logic)
    const video = await createVideo(videoData);
    
    // Log audit event
    await auditService.logVideoAction(
      adminId,
      AuditAction.VIDEO_CREATED,
      video.id,
      `Created video: ${video.title}`,
      videoData
    );
    
    // Create notification
    await notificationService.notifyVideoUpload(
      video.id,
      video.title,
      adminId
    );
    
    return video;
  } catch (error) {
    // Log error
    console.error("Video upload failed:", error);
    
    // Create error notification
    await notificationService.notifySystemAlert(
      "Video Upload Failed",
      `Failed to upload video: ${videoData.title}`,
      NotificationSeverity.ERROR
    );
    
    throw error;
  }
}
```

## API Usage Examples

### Audit Logs API

```bash
# Get audit logs with filters
GET /api/admin/audit-logs?page=1&limit=20&action=USER_UPDATED&dateFrom=2024-01-01

# Export audit logs
POST /api/admin/audit-logs?action=export
Content-Type: application/json
{
  "filters": {
    "dateFrom": "2024-01-01",
    "dateTo": "2024-12-31"
  }
}

# Get audit statistics
POST /api/admin/audit-logs?action=statistics
Content-Type: application/json
{
  "dateFrom": "2024-01-01",
  "dateTo": "2024-12-31"
}

# Clean up old logs
POST /api/admin/audit-logs?action=cleanup
Content-Type: application/json
{
  "retentionDays": 365
}
```

### Notifications API

```bash
# Get notifications
GET /api/admin/notifications?isRead=false&type=WITHDRAWAL_REQUEST&page=1&limit=20

# Create notification
POST /api/admin/notifications
Content-Type: application/json
{
  "type": "SYSTEM_ALERT",
  "title": "System Maintenance",
  "message": "Scheduled maintenance tonight",
  "severity": "WARNING",
  "targetType": "admin",
  "actionUrl": "/admin/maintenance"
}

# Mark notifications as read
PATCH /api/admin/notifications?action=mark-read
Content-Type: application/json
{
  "notificationIds": ["notif-1", "notif-2"]
}

# Mark all as read
PATCH /api/admin/notifications?action=mark-all-read
Content-Type: application/json
{
  "targetType": "admin",
  "targetId": "admin-id"
}

# Bulk delete notifications
DELETE /api/admin/notifications?action=bulk-delete
Content-Type: application/json
{
  "notificationIds": ["notif-1", "notif-2"]
}

# Clean up old notifications
DELETE /api/admin/notifications?action=cleanup
Content-Type: application/json
{
  "retentionDays": 90
}
```

### JavaScript/TypeScript Client Usage

```typescript
// Client-side usage examples
class AdminAPIClient {
  private baseUrl = "/api/admin";
  
  async getAuditLogs(filters: any = {}, page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    const response = await fetch(`${this.baseUrl}/audit-logs?${params}`);
    return response.json();
  }
  
  async createNotification(notification: any) {
    const response = await fetch(`${this.baseUrl}/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notification)
    });
    return response.json();
  }
  
  async markNotificationsAsRead(notificationIds: string[]) {
    const response = await fetch(`${this.baseUrl}/notifications?action=mark-read`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationIds })
    });
    return response.json();
  }
  
  async exportAuditLogs(filters: any = {}) {
    const response = await fetch(`${this.baseUrl}/audit-logs?action=export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filters })
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audit-logs.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }
}

// Usage
const adminAPI = new AdminAPIClient();

// Get recent audit logs
const auditLogs = await adminAPI.getAuditLogs({
  action: "USER_UPDATED",
  dateFrom: "2024-01-01"
});

// Create system alert
await adminAPI.createNotification({
  type: "SYSTEM_ALERT",
  title: "Important Update",
  message: "System will be updated tonight",
  severity: "WARNING"
});

// Export logs
await adminAPI.exportAuditLogs({
  dateFrom: "2024-01-01",
  dateTo: "2024-12-31"
});
```

## Best Practices

### 1. Audit Logging Best Practices

```typescript
// Always include context in audit logs
await auditService.logUserAction(
  adminId,
  AuditAction.USER_BALANCE_UPDATED,
  userId,
  "Balance updated via admin panel", // Clear description
  {
    previousBalance: 100.00,
    newBalance: 150.00,
    reason: "Compensation for service disruption",
    adminNotes: "Approved by supervisor"
  },
  ipAddress,
  userAgent
);

// Log both successful and failed operations
try {
  await updateUserBalance(userId, newBalance);
  await auditService.log(
    AuditAction.USER_BALANCE_UPDATED,
    "user",
    `Successfully updated balance for user ${userId}`,
    { adminId, userId, newBalance }
  );
} catch (error) {
  await auditService.log(
    AuditAction.USER_BALANCE_UPDATED,
    "user",
    `Failed to update balance for user ${userId}: ${error.message}`,
    { adminId, userId, newBalance, error: error.message }
  );
  throw error;
}
```

### 2. Notification Best Practices

```typescript
// Use appropriate severity levels
await notificationService.notifySystemAlert(
  "Database Connection Lost",
  "Unable to connect to primary database. Switching to backup.",
  NotificationSeverity.ERROR, // High priority for critical issues
  "/admin/system-status"
);

// Include actionable information
await notificationService.notifyWithdrawalRequest(
  withdrawalId,
  userId,
  amount,
  userName
); // This automatically includes action URL to review the withdrawal

// Batch notifications for efficiency
const notifications = users.map(user => ({
  type: NotificationType.USER_ACTION,
  title: "Account Verification Required",
  message: `User ${user.name} needs to verify their account`,
  targetType: "user",
  targetId: user.id,
  actionUrl: `/admin/users/${user.id}/verify`
}));

await notificationService.createBulkNotifications(notifications);
```

### 3. File Upload Best Practices

```typescript
// Always validate files before upload
const uploadResult = await fileUploadService.uploadFile(
  file,
  originalName,
  FileUploadType.VIDEO,
  adminId,
  {
    maxSize: 500 * 1024 * 1024, // 500MB limit for videos
    allowedTypes: [".mp4", ".avi", ".mov"], // Restrict file types
    generateThumbnail: true, // Generate thumbnails for videos
    processVideo: true // Enable video processing
  }
);

if (!uploadResult.success) {
  // Log failed upload
  await auditService.log(
    AuditAction.VIDEO_CREATED,
    "video",
    `Failed to upload video: ${uploadResult.error}`,
    { adminId, originalName, error: uploadResult.error }
  );
  
  // Notify about failure
  await notificationService.notifySystemAlert(
    "Video Upload Failed",
    `Failed to upload ${originalName}: ${uploadResult.error}`,
    NotificationSeverity.ERROR
  );
}

// Regular cleanup of old files
async function cleanupOldFiles() {
  const stats = await fileUploadService.getFileStatistics();
  console.log(`Current storage: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
  
  const orphanedCount = await fileUploadService.cleanupOrphanedFiles();
  console.log(`Cleaned up ${orphanedCount} orphaned files`);
  
  // Log cleanup activity
  await auditService.log(
    AuditAction.DATA_EXPORT,
    "system",
    `File cleanup completed: ${orphanedCount} orphaned files removed`,
    { orphanedCount, totalFiles: stats.totalFiles }
  );
}
```

## Error Handling

```typescript
// Comprehensive error handling with notifications
async function safeAdminOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  adminId: string
): Promise<T | null> {
  try {
    const result = await operation();
    
    // Log successful operation
    await auditService.log(
      AuditAction.ADMIN_LOGIN,
      "admin",
      `${operationName} completed successfully`,
      { adminId, timestamp: new Date() }
    );
    
    return result;
  } catch (error) {
    // Log error
    await auditService.log(
      AuditAction.ADMIN_LOGIN,
      "admin",
      `${operationName} failed: ${error.message}`,
      { adminId, error: error.message, stack: error.stack }
    );
    
    // Create error notification
    await notificationService.notifySystemAlert(
      `${operationName} Failed`,
      `Operation failed: ${error.message}`,
      NotificationSeverity.ERROR,
      undefined,
      { adminId, operationName, error: error.message }
    );
    
    return null;
  }
}

// Usage
const result = await safeAdminOperation(
  () => userManagementService.updateUser(userId, updateData, adminId),
  "User Update",
  adminId
);
```

This comprehensive guide shows how to effectively use all the new admin functionality. The system now provides complete audit trails, professional notifications, and robust file management capabilities for your admin panel.