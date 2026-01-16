"use client";

import { useState, useEffect } from "react";
import {
  DownloadIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  Database,
  Shield,
  Filter,
} from "lucide-react";

// Reusable UI Components
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Table = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`w-full overflow-auto ${className}`}>
    <table className="w-full caption-bottom text-sm">{children}</table>
  </div>
);

const TableHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <thead className={className}>{children}</thead>
);

const TableBody = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <tbody className={className}>{children}</tbody>
);

const TableRow = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <tr
    className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}
  >
    {children}
  </tr>
);

const TableHead = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <th
    className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}
  >
    {children}
  </th>
);

const TableCell = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</td>
);

const Input = ({
  value,
  onChange,
  placeholder,
  className = "",
  type = "text",
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  type?: string;
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

const Button = ({
  children,
  onClick,
  variant = "default",
  size = "default",
  disabled = false,
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) => {
  const baseStyles =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };

  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const Badge = ({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}) => {
  const baseStyles =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  const variantStyles = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground",
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Date formatting function
const formatDate = (date: Date) =>
  date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(",", "");

// Main Component
interface AuditLog {
  id: string;
  timestamp: Date;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "EXPORT";
  entity: "QUIZ" | "QUESTION" | "USER" | "RESULT" | "SYSTEM";
  userId: string;
  userName: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  details: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [selectedEntity, setSelectedEntity] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data
  useEffect(() => {
    const mockLogs: AuditLog[] = [
      { id: "1", timestamp: new Date("2024-01-15T10:30:00"), action: "CREATE", entity: "QUIZ", userId: "user-123", userName: "John Doe", userEmail: "john@example.com", ipAddress: "192.168.1.1", userAgent: "Chrome/120.0", details: "Created quiz 'Advanced JavaScript'" },
      { id: "2", timestamp: new Date("2024-01-15T09:15:00"), action: "UPDATE", entity: "QUESTION", userId: "user-456", userName: "Jane Smith", userEmail: "jane@example.com", ipAddress: "192.168.1.2", userAgent: "Firefox/121.0", details: "Updated question #42 in quiz 'HTML Basics'" },
      { id: "3", timestamp: new Date("2024-01-14T14:20:00"), action: "LOGIN", entity: "USER", userId: "user-789", userName: "Admin User", userEmail: "admin@example.com", ipAddress: "192.168.1.3", userAgent: "Safari/17.0", details: "Successful login from new device" },
      { id: "4", timestamp: new Date("2024-01-14T11:45:00"), action: "DELETE", entity: "RESULT", userId: "user-123", userName: "John Doe", userEmail: "john@example.com", ipAddress: "192.168.1.1", userAgent: "Chrome/120.0", details: "Deleted quiz result for user 'student-001'" },
      { id: "5", timestamp: new Date("2024-01-13T16:30:00"), action: "EXPORT", entity: "SYSTEM", userId: "user-456", userName: "Jane Smith", userEmail: "jane@example.com", ipAddress: "192.168.1.2", userAgent: "Firefox/121.0", details: "Exported all quiz results as CSV" },
      { id: "6", timestamp: new Date("2024-01-13T10:00:00"), action: "CREATE", entity: "QUESTION", userId: "user-789", userName: "Admin User", userEmail: "admin@example.com", ipAddress: "192.168.1.3", userAgent: "Safari/17.0", details: "Created new question for quiz 'React Fundamentals'" },
      { id: "7", timestamp: new Date("2024-01-12T15:45:00"), action: "UPDATE", entity: "QUIZ", userId: "user-123", userName: "John Doe", userEmail: "john@example.com", ipAddress: "192.168.1.1", userAgent: "Chrome/120.0", details: "Updated quiz settings for 'Python Basics'" },
      { id: "8", timestamp: new Date("2024-01-12T11:20:00"), action: "LOGIN", entity: "USER", userId: "user-999", userName: "Test User", userEmail: "test@example.com", ipAddress: "192.168.1.5", userAgent: "Edge/120.0", details: "Failed login attempt" },
      { id: "9", timestamp: new Date("2024-01-11T13:10:00"), action: "CREATE", entity: "RESULT", userId: "user-456", userName: "Jane Smith", userEmail: "jane@example.com", ipAddress: "192.168.1.2", userAgent: "Firefox/121.0", details: "Quiz result recorded for 'student-002'" },
      { id: "10", timestamp: new Date("2024-01-10T09:05:00"), action: "DELETE", entity: "QUESTION", userId: "user-789", userName: "Admin User", userEmail: "admin@example.com", ipAddress: "192.168.1.3", userAgent: "Safari/17.0", details: "Deleted outdated question from quiz 'HTML Basics'" },
    ];
    setLogs(mockLogs);
    setFilteredLogs(mockLogs);
  }, []);

  // Filtering logic
  useEffect(() => {
    let result = logs;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (log) =>
          log.userName.toLowerCase().includes(query) ||
          log.userEmail.toLowerCase().includes(query) ||
          log.details.toLowerCase().includes(query) ||
          log.ipAddress.includes(query)
      );
    }

    if (selectedAction !== "all") result = result.filter((log) => log.action === selectedAction);
    if (selectedEntity !== "all") result = result.filter((log) => log.entity === selectedEntity);

    setFilteredLogs(result);
    setCurrentPage(1);
  }, [searchQuery, selectedAction, selectedEntity, logs]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE": return <Badge className="bg-green-100 text-green-800 border-green-200">Create</Badge>;
      case "UPDATE": return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Update</Badge>;
      case "DELETE": return <Badge className="bg-red-100 text-red-800 border-red-200">Delete</Badge>;
      case "LOGIN": return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Login</Badge>;
      case "EXPORT": return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Export</Badge>;
      default: return <Badge>{action}</Badge>;
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case "QUIZ":
      case "QUESTION": return <FileText className="h-4 w-4" />;
      case "USER": return <User className="h-4 w-4" />;
      case "RESULT": return <Database className="h-4 w-4" />;
      case "SYSTEM": return <Shield className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* HEADER & EXPORT BUTTON */}
      <div className="mb-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="mt-2 text-gray-600">Monitor all activities and changes in your quiz platform</p>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>View and filter all system activities</CardDescription>
              </div>
              <Button
                variant="outline"
                className="mt-4 sm:mt-0"
                onClick={() => {
                  const csv = filteredLogs
                    .map(
                      (log) =>
                        `${log.id},${log.timestamp.toISOString()},${log.action},${log.entity},${log.userName},${log.userEmail},${log.ipAddress},"${log.details}"`
                    )
                    .join("\n");
                  const blob = new Blob(
                    [
                      `id,timestamp,action,entity,userName,userEmail,ipAddress,details\n${csv}`,
                    ],
                    { type: "text/csv" }
                  );
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "audit-logs.csv";
                  a.click();
                }}
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                Export Logs
              </Button>
            </div>
          </CardHeader>

          {/* FILTERS */}
          <CardContent>
            <div className="mb-6 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Search className="h-4 w-4" /></div>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by user, email, IP, or details..."
                  className="pl-10"
                />
              </div>

              <div className="flex space-x-2">
                {/* Action Select */}
                <select
                  className="h-10 w-[140px] border rounded px-2"
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                >
                  <option value="all">All Actions</option>
                  <option value="CREATE">Create</option>
                  <option value="UPDATE">Update</option>
                  <option value="DELETE">Delete</option>
                  <option value="LOGIN">Login</option>
                  <option value="EXPORT">Export</option>
                </select>

                {/* Entity Select */}
                <select
                  className="h-10 w-[140px] border rounded px-2"
                  value={selectedEntity}
                  onChange={(e) => setSelectedEntity(e.target.value)}
                >
                  <option value="all">All Entities</option>
                  <option value="QUIZ">Quiz</option>
                  <option value="QUESTION">Question</option>
                  <option value="USER">User</option>
                  <option value="RESULT">Result</option>
                  <option value="SYSTEM">System</option>
                </select>
              </div>
            </div>

            {/* TABLE */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.timestamp)}</TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="flex items-center space-x-2">
                        {getEntityIcon(log.entity)}
                        <span>{log.entity}</span>
                      </TableCell>
                      <TableCell>{log.userName} ({log.userEmail})</TableCell>
                      <TableCell>{log.ipAddress}</TableCell>
                      <TableCell>{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* PAGINATION */}
              <div className="flex justify-end items-center space-x-2 p-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
