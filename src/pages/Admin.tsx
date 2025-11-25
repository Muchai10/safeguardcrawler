import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Users, Settings, Database, Activity, Bell, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Admin = () => {
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', status: 'active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', status: 'inactive' },
  ];

  const mockSystemStats = [
    { label: 'Total Users', value: '156', change: '+12%', icon: Users },
    { label: 'Active Alerts', value: '23', change: '-5%', icon: AlertTriangle },
    { label: 'Data Sources', value: '8', change: '0%', icon: Database },
    { label: 'Uptime', value: '99.9%', change: '+0.1%', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2">
                <Shield className="w-7 h-7 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">Admin Dashboard</h1>
                  <p className="text-xs text-muted-foreground">System Management</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  Main Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {mockSystemStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <Badge variant={stat.change.startsWith('+') ? 'default' : 'secondary'} className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alert Config
            </TabsTrigger>
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Data Sources
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              System Settings
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user accounts and permissions</CardDescription>
                  </div>
                  <Button>Add User</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === 'active' ? 'default' : 'outline'}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm">Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Alert Thresholds</CardTitle>
                  <CardDescription>Configure severity level thresholds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">High Severity</span>
                      <Badge variant="destructive">Score &gt; 0.8</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Medium Severity</span>
                      <Badge variant="default">Score 0.5 - 0.8</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Low Severity</span>
                      <Badge variant="secondary">Score &lt; 0.5</Badge>
                    </div>
                  </div>
                  <Button className="w-full">Update Thresholds</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Manage alert notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email Notifications</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Push Notifications</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">SMS Alerts</span>
                      <Badge variant="outline">Disabled</Badge>
                    </div>
                  </div>
                  <Button className="w-full">Configure</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Sources Tab */}
          <TabsContent value="sources" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Active Data Sources</CardTitle>
                    <CardDescription>Monitor and configure crawling sources</CardDescription>
                  </div>
                  <Button>Add Source</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Twitter', 'Facebook', 'Reddit', 'News Sites'].map((source, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">{source}</p>
                          <p className="text-sm text-muted-foreground">Last crawl: {idx + 1}h ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Active</Badge>
                        <Button variant="ghost" size="sm">Configure</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure global system parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Crawler Settings</h4>
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Crawl Frequency</span>
                      <span className="text-sm font-medium">Every 15 minutes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Max Threads</span>
                      <span className="text-sm font-medium">10</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Privacy Settings</h4>
                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Data Retention</span>
                      <span className="text-sm font-medium">30 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">PII Redaction</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                  </div>
                </div>
                
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
