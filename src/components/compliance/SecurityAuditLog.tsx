import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Search,
  Download,
  Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AuditEvent {
  id: string;
  event_type: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  resource: string;
  action: string;
  outcome: 'success' | 'failure' | 'blocked';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  details: any;
  timestamp: string;
}

export const SecurityAuditLog = () => {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    eventType: '',
    outcome: '',
    riskLevel: '',
    dateRange: '7d'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, [filters]);

  const fetchAuditLogs = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Mock audit data - in production, this would come from your audit system
      const mockAuditData: AuditEvent[] = [
        {
          id: '1',
          event_type: 'AUTH_LOGIN',
          user_id: user.id,
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          resource: '/auth',
          action: 'LOGIN',
          outcome: 'success',
          risk_level: 'low',
          details: { method: 'email_otp' },
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          event_type: 'DATA_ACCESS',
          user_id: user.id,
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          resource: '/profile',
          action: 'READ',
          outcome: 'success',
          risk_level: 'low',
          details: { data_type: 'profile_info' },
          timestamp: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: '3',
          event_type: 'PAYMENT_PROCESS',
          user_id: user.id,
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          resource: '/checkout',
          action: 'PAYMENT',
          outcome: 'success',
          risk_level: 'medium',
          details: { amount: 45.99, currency: 'USD' },
          timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '4',
          event_type: 'DATA_EXPORT',
          user_id: user.id,
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          resource: '/privacy/export',
          action: 'EXPORT',
          outcome: 'success',
          risk_level: 'medium',
          details: { export_type: 'gdpr_request' },
          timestamp: new Date(Date.now() - 172800000).toISOString()
        }
      ];

      setAuditLogs(mockAuditData);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failure': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'blocked': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const exportAuditLog = () => {
    const csvContent = [
      ['Timestamp', 'Event Type', 'Action', 'Resource', 'Outcome', 'Risk Level', 'IP Address'],
      ...auditLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.event_type,
        log.action,
        log.resource,
        log.outcome,
        log.risk_level,
        log.ip_address
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEventType = filters.eventType === '' || log.event_type === filters.eventType;
    const matchesOutcome = filters.outcome === '' || log.outcome === filters.outcome;
    const matchesRiskLevel = filters.riskLevel === '' || log.risk_level === filters.riskLevel;

    return matchesSearch && matchesEventType && matchesOutcome && matchesRiskLevel;
  });

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Audit Log
            </div>
            <Button 
              onClick={exportAuditLog}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label className="text-gray-300 text-sm">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-gray-300 text-sm">Event Type</Label>
              <Select value={filters.eventType} onValueChange={(value) => setFilters(prev => ({ ...prev, eventType: value }))}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="All events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Events</SelectItem>
                  <SelectItem value="AUTH_LOGIN">Authentication</SelectItem>
                  <SelectItem value="DATA_ACCESS">Data Access</SelectItem>
                  <SelectItem value="PAYMENT_PROCESS">Payment</SelectItem>
                  <SelectItem value="DATA_EXPORT">Data Export</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300 text-sm">Outcome</Label>
              <Select value={filters.outcome} onValueChange={(value) => setFilters(prev => ({ ...prev, outcome: value }))}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="All outcomes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Outcomes</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300 text-sm">Risk Level</Label>
              <Select value={filters.riskLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, riskLevel: value }))}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300 text-sm">Date Range</Label>
              <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Audit Log Entries */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center text-gray-400 py-8">Loading audit logs...</div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No audit logs found matching your criteria.</div>
            ) : (
              filteredLogs.map((log) => (
                <Card key={log.id} className="bg-gray-800/30 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getOutcomeIcon(log.outcome)}
                          <span className="text-white font-medium">{log.event_type.replace('_', ' ')}</span>
                          <Badge className={getRiskColor(log.risk_level)}>
                            {log.risk_level.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-300 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Action:</span>
                            <span>{log.action}</span>
                            <span className="text-gray-400">on</span>
                            <span className="font-mono bg-gray-700/50 px-2 py-1 rounded text-xs">{log.resource}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">IP:</span>
                            <span className="font-mono">{log.ip_address}</span>
                          </div>
                          {log.details && Object.keys(log.details).length > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Details:</span>
                              <span className="text-xs bg-gray-700/50 px-2 py-1 rounded">
                                {JSON.stringify(log.details)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-400">
                        <div className="flex items-center gap-1 mb-1">
                          <Clock className="h-3 w-3" />
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-xs">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};