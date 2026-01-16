"use client"

import { useState, useEffect } from "react"

// Reusable UI Components
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
)

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
)

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
)

const CardDescription = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>
    {children}
  </p>
)

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
)

const Table = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`w-full overflow-auto ${className}`}>
    <table className="w-full caption-bottom text-sm">
      {children}
    </table>
  </div>
)

const TableHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <thead className={className}>
    {children}
  </thead>
)

const TableBody = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <tbody className={className}>
    {children}
  </tbody>
)

const TableRow = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}>
    {children}
  </tr>
)

const TableHead = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}>
    {children}
  </th>
)

const TableCell = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>
    {children}
  </td>
)

const Input = ({ 
  value, 
  onChange, 
  placeholder, 
  className = "",
  type = "text"
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
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
)

const Button = ({ 
  children, 
  onClick, 
  variant = "default", 
  size = "default", 
  disabled = false,
  className = "",
  type = "button"
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  
  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  }
  
  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8"
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </button>
  )
}

const Badge = ({ children, className = "", variant = "default" }: { children: React.ReactNode; className?: string; variant?: "default" | "secondary" | "destructive" | "outline" }) => {
  const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  
  const variantStyles = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground"
  }
  
  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}

const Select = ({ 
  value, 
  onValueChange, 
  children,
  placeholder = "Select...",
  className = ""
}: { 
  value: string; 
  onValueChange: (value: string) => void; 
  children: React.ReactNode;
  placeholder?: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false)
  
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="truncate">{value || placeholder}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 opacity-50"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {children}
        </div>
      )}
    </div>
  )
}

const SelectTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>
const SelectValue = ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>
const SelectContent = ({ children }: { children: React.ReactNode }) => <div className="py-1">{children}</div>
const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <div
    onClick={() => {}}
    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
  >
    {children}
  </div>
)

// Icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
)

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
)

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" x2="12" y1="15" y2="3"/>
  </svg>
)

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="m15 18-6-6 6-6"/>
  </svg>
)

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="m9 18 6-6-6-6"/>
  </svg>
)

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const FileTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
    <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
    <path d="M10 9H8"/>
    <path d="M16 13H8"/>
    <path d="M16 17H8"/>
  </svg>
)

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
  </svg>
)

const DatabaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M3 5v14a9 3 0 0 0 18 0V5"/>
    <path d="M3 12a9 3 0 0 0 18 0"/>
  </svg>
)

// Date formatting function
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(',', '')
}

// Main Component
interface AuditLog {
  id: string
  timestamp: Date
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "EXPORT"
  entity: "QUIZ" | "QUESTION" | "USER" | "RESULT" | "SYSTEM"
  userId: string
  userName: string
  userEmail: string
  ipAddress: string
  userAgent: string
  details: string
}

const AuditLogsUI = () => {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAction, setSelectedAction] = useState<string>("all")
  const [selectedEntity, setSelectedEntity] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Mock data
  useEffect(() => {
    const mockLogs: AuditLog[] = [
      {
        id: "1",
        timestamp: new Date("2024-01-15T10:30:00"),
        action: "CREATE",
        entity: "QUIZ",
        userId: "user-123",
        userName: "John Doe",
        userEmail: "john@example.com",
        ipAddress: "192.168.1.1",
        userAgent: "Chrome/120.0",
        details: "Created quiz 'Advanced JavaScript'"
      },
      {
        id: "2",
        timestamp: new Date("2024-01-15T09:15:00"),
        action: "UPDATE",
        entity: "QUESTION",
        userId: "user-456",
        userName: "Jane Smith",
        userEmail: "jane@example.com",
        ipAddress: "192.168.1.2",
        userAgent: "Firefox/121.0",
        details: "Updated question #42 in quiz 'HTML Basics'"
      },
      {
        id: "3",
        timestamp: new Date("2024-01-14T14:20:00"),
        action: "LOGIN",
        entity: "USER",
        userId: "user-789",
        userName: "Admin User",
        userEmail: "admin@example.com",
        ipAddress: "192.168.1.3",
        userAgent: "Safari/17.0",
        details: "Successful login from new device"
      },
      {
        id: "4",
        timestamp: new Date("2024-01-14T11:45:00"),
        action: "DELETE",
        entity: "RESULT",
        userId: "user-123",
        userName: "John Doe",
        userEmail: "john@example.com",
        ipAddress: "192.168.1.1",
        userAgent: "Chrome/120.0",
        details: "Deleted quiz result for user 'student-001'"
      },
      {
        id: "5",
        timestamp: new Date("2024-01-13T16:30:00"),
        action: "EXPORT",
        entity: "SYSTEM",
        userId: "user-456",
        userName: "Jane Smith",
        userEmail: "jane@example.com",
        ipAddress: "192.168.1.2",
        userAgent: "Firefox/121.0",
        details: "Exported all quiz results as CSV"
      },
      {
        id: "6",
        timestamp: new Date("2024-01-13T10:00:00"),
        action: "CREATE",
        entity: "QUESTION",
        userId: "user-789",
        userName: "Admin User",
        userEmail: "admin@example.com",
        ipAddress: "192.168.1.3",
        userAgent: "Safari/17.0",
        details: "Created new question for quiz 'React Fundamentals'"
      },
      {
        id: "7",
        timestamp: new Date("2024-01-12T15:45:00"),
        action: "UPDATE",
        entity: "QUIZ",
        userId: "user-123",
        userName: "John Doe",
        userEmail: "john@example.com",
        ipAddress: "192.168.1.1",
        userAgent: "Chrome/120.0",
        details: "Updated quiz settings for 'Python Basics'"
      },
      {
        id: "8",
        timestamp: new Date("2024-01-12T11:20:00"),
        action: "LOGIN",
        entity: "USER",
        userId: "user-999",
        userName: "Test User",
        userEmail: "test@example.com",
        ipAddress: "192.168.1.5",
        userAgent: "Edge/120.0",
        details: "Failed login attempt"
      },
      {
        id: "9",
        timestamp: new Date("2024-01-11T13:10:00"),
        action: "CREATE",
        entity: "RESULT",
        userId: "user-456",
        userName: "Jane Smith",
        userEmail: "jane@example.com",
        ipAddress: "192.168.1.2",
        userAgent: "Firefox/121.0",
        details: "Quiz result recorded for 'student-002'"
      },
      {
        id: "10",
        timestamp: new Date("2024-01-10T09:05:00"),
        action: "DELETE",
        entity: "QUESTION",
        userId: "user-789",
        userName: "Admin User",
        userEmail: "admin@example.com",
        ipAddress: "192.168.1.3",
        userAgent: "Safari/17.0",
        details: "Deleted outdated question from quiz 'HTML Basics'"
      }
    ]
    setLogs(mockLogs)
    setFilteredLogs(mockLogs)
  }, [])

  useEffect(() => {
    let result = logs
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(log => 
        log.userName.toLowerCase().includes(query) ||
        log.userEmail.toLowerCase().includes(query) ||
        log.details.toLowerCase().includes(query) ||
        log.ipAddress.includes(query)
      )
    }
    
    if (selectedAction !== "all") {
      result = result.filter(log => log.action === selectedAction)
    }
    
    if (selectedEntity !== "all") {
      result = result.filter(log => log.entity === selectedEntity)
    }
    
    setFilteredLogs(result)
    setCurrentPage(1)
  }, [searchQuery, selectedAction, selectedEntity, logs])

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Create</Badge>
      case "UPDATE":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Update</Badge>
      case "DELETE":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Delete</Badge>
      case "LOGIN":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Login</Badge>
      case "EXPORT":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Export</Badge>
      default:
        return <Badge>{action}</Badge>
    }
  }

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case "QUIZ":
      case "QUESTION":
        return <FileTextIcon />
      case "USER":
        return <UserIcon />
      case "RESULT":
        return <DatabaseIcon />
      case "SYSTEM":
        return <ShieldIcon />
      default:
        return <FileTextIcon />
    }
  }

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentLogs = filteredLogs.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-2 text-gray-600">
            Monitor all activities and changes in your quiz platform
          </p>
        </div>

        {/* Main Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>
                  View and filter all system activities
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                className="mt-4 sm:mt-0"
                onClick={() => {
                  // Export functionality
                  const csv = filteredLogs.map(log => 
                    `${log.id},${log.timestamp.toISOString()},${log.action},${log.entity},${log.userName},${log.userEmail},${log.ipAddress},"${log.details}"`
                  ).join('\n')
                  const blob = new Blob([`id,timestamp,action,entity,userName,userEmail,ipAddress,details\n${csv}`], { type: 'text/csv' })
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'audit-logs.csv'
                  a.click()
                }}
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                Export Logs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 space-y-4 sm:flex sm:space-x-4 sm:space-y-0">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <SearchIcon />
                </div>
                <Input
                  type="text"
                  placeholder="Search by user, email, IP, or details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex space-x-2">
                <Select value={selectedAction} onValueChange={setSelectedAction}>
                  <SelectTrigger className="w-[140px]">
                    <div className="flex items-center">
                      <FilterIcon className="mr-2 h-4 w-4" />
                      <span>{selectedAction === "all" ? "All Actions" : selectedAction}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="CREATE">Create</SelectItem>
                    <SelectItem value="UPDATE">Update</SelectItem>
                    <SelectItem value="DELETE">Delete</SelectItem>
                    <SelectItem value="LOGIN">Login</SelectItem>
                    <SelectItem value="EXPORT">Export</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                  <SelectTrigger className="w-[140px]">
                    <span>{selectedEntity === "all" ? "All Entities" : selectedEntity}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entities</SelectItem>
                    <SelectItem value="QUIZ">Quiz</SelectItem>
                    <SelectItem value="QUESTION">Question</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="RESULT">Result</SelectItem>
                    <SelectItem value="SYSTEM">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
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
                  {currentLogs.length > 0 ? (
                    currentLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {formatDate(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          {getActionBadge(log.action)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getEntityIcon(log.entity)}
                            <span className="font-medium">{log.entity}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.userName}</div>
                            <div className="text-sm text-gray-500">{log.userEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm">
                            {log.ipAddress}
                          </code>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.details}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                        No audit logs found matching your filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} entries
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Activities Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Activities</p>
                  <p className="mt-2 text-3xl font-bold">{filteredLogs.length}</p>
                </div>
                <div className="rounded-full bg-blue-100 p-3">
                  <DatabaseIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">All tracked activities</p>
            </CardContent>
          </Card>

          {/* Unique Users Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unique Users</p>
                  <p className="mt-2 text-3xl font-bold">
                    {new Set(filteredLogs.map(log => log.userId)).size}
                  </p>
                </div>
                <div className="rounded-full bg-green-100 p-3">
                  <UserIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">Active users in period</p>
            </CardContent>
          </Card>

          {/* Most Active User Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Most Active</p>
                  <p className="mt-2 text-xl font-bold truncate">
                    {filteredLogs.length > 0 
                      ? (() => {
                          const userCounts = filteredLogs.reduce((acc, log) => {
                            acc[log.userName] = (acc[log.userName] || 0) + 1
                            return acc
                          }, {} as Record<string, number>)
                          
                          const mostActive = Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0]
                          return mostActive ? mostActive[0] : "N/A"
                        })()
                      : "N/A"}
                  </p>
                </div>
                <div className="rounded-full bg-purple-100 p-3">
                  <ShieldIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">User with most activities</p>
            </CardContent>
          </Card>

          {/* Last Updated Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Updated</p>
                  <p className="mt-2 text-xl font-bold">
                    {filteredLogs.length > 0 
                      ? formatDate(filteredLogs[0].timestamp).split(' ')[3]
                      : "N/A"}
                  </p>
                </div>
                <div className="rounded-full bg-orange-100 p-3">
                  <FileTextIcon className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {filteredLogs.length > 0 
                  ? formatDate(filteredLogs[0].timestamp).split(' ').slice(0, 3).join(' ')
                  : "No activities"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AuditLogsUI