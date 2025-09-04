"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MoreHorizontal } from "lucide-react";
import { UserManagement, UserStatus } from "@/types/admin";

const users: UserManagement[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: null,
    registrationDate: new Date("2023-01-15"),
    lastLogin: new Date("2023-10-26"),
    status: UserStatus.ACTIVE,
    emailVerified: true,
    phoneVerified: false,
    referralCode: "REF001",
    referredBy: null,
    walletBalance: 150.0,
    totalEarnings: 300.0,
    currentPosition: "p1-id",
    positionLevel: "P1",
    engagement: 75,
    totalVideosTasks: 45,
    totalReferrals: 3,
    ipAddress: "192.168.1.1",
    deviceId: "device-001",
    isIntern: false,
    depositPaid: 100.0,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1234567890",
    registrationDate: new Date("2023-02-20"),
    lastLogin: new Date("2023-10-25"),
    status: UserStatus.SUSPENDED,
    emailVerified: true,
    phoneVerified: true,
    referralCode: "REF002",
    referredBy: "1",
    walletBalance: 75.0,
    totalEarnings: 125.0,
    currentPosition: null,
    positionLevel: "Intern",
    engagement: 50,
    totalVideosTasks: 20,
    totalReferrals: 1,
    ipAddress: "192.168.1.2",
    deviceId: "device-002",
    isIntern: true,
    depositPaid: 0.0,
  },
];

export function UserManagementClient() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">User Management</h1>
      <div className="flex items-center justify-between">
        <Input placeholder="Search users..." className="max-w-sm" />
        <Button>Add User</Button>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Engagement</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {user.registrationDate.toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {user.lastLogin?.toLocaleDateString() || "Never"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.status === UserStatus.ACTIVE
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>{user.engagement}%</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch checked={user.status === UserStatus.ACTIVE} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-8 h-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500">
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
