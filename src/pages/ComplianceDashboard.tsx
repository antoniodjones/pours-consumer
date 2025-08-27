import React, { useState } from 'react';
import { DataPrivacyControls } from '@/components/compliance/DataPrivacyControls';
import { SecurityAuditLog } from '@/components/compliance/SecurityAuditLog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Lock, 
  FileText, 
  Database, 
  AlertTriangle, 
  CheckCircle,
  ArrowLeft,
  Eye,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const ComplianceDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const complianceStatus = {
    gdpr: { status: 'compliant', lastUpdated: '2024-01-15' },
    ccpa: { status: 'compliant', lastUpdated: '2024-01-15' },
    pci: { status: 'compliant', lastUpdated: '2024-01-10' },
    sox: { status: 'in_progress', lastUpdated: '2024-01-12' }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Compliant</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">In Progress</Badge>;
      case 'non_compliant':
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Non-Compliant</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'in_progress':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'non_compliant':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/profile")}
                className="text-white hover:text-yellow-400"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">Compliance Dashboard</h1>
                <p className="text-gray-300">Privacy controls and security monitoring</p>
              </div>
            </div>
          </div>

          {/* Compliance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Object.entries({
              gdpr: { name: 'GDPR', icon: Shield, description: 'EU General Data Protection Regulation' },
              ccpa: { name: 'CCPA', icon: Eye, description: 'California Consumer Privacy Act' },
              pci: { name: 'PCI DSS', icon: Lock, description: 'Payment Card Industry Standards' },
              sox: { name: 'SOX-2', icon: FileText, description: 'Sarbanes-Oxley Controls' }
            }).map(([key, config]) => {
              const status = complianceStatus[key as keyof typeof complianceStatus];
              return (
                <Card key={key} className="bg-black/40 backdrop-blur-sm border-purple-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <config.icon className="h-8 w-8 text-yellow-400" />
                      {getStatusIcon(status.status)}
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-1">{config.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">{config.description}</p>
                    <div className="flex items-center justify-between">
                      {getStatusBadge(status.status)}
                      <span className="text-xs text-gray-500">
                        Updated {new Date(status.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Main Compliance Tools */}
          <Tabs defaultValue="privacy" className="space-y-6">
            <TabsList className="bg-black/40 border-purple-500/20">
              <TabsTrigger 
                value="privacy" 
                className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
              >
                <Shield className="h-4 w-4 mr-2" />
                Privacy Controls
              </TabsTrigger>
              <TabsTrigger 
                value="audit" 
                className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
              >
                <Database className="h-4 w-4 mr-2" />
                Audit Logs
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
              >
                <FileText className="h-4 w-4 mr-2" />
                Compliance Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="privacy">
              <DataPrivacyControls />
            </TabsContent>

            <TabsContent value="audit">
              <SecurityAuditLog />
            </TabsContent>

            <TabsContent value="reports">
              <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <FileText className="h-5 w-5" />
                    Compliance Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gray-800/50 border-gray-600">
                      <CardContent className="p-6">
                        <h3 className="text-white font-semibold mb-3">GDPR Compliance Report</h3>
                        <p className="text-gray-300 text-sm mb-4">
                          Comprehensive report on GDPR compliance status, data processing activities, 
                          and user consent management.
                        </p>
                        <Button className="w-full bg-blue-500 hover:bg-blue-600">
                          <Download className="h-4 w-4 mr-2" />
                          Generate GDPR Report
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-600">
                      <CardContent className="p-6">
                        <h3 className="text-white font-semibold mb-3">PCI DSS Assessment</h3>
                        <p className="text-gray-300 text-sm mb-4">
                          Payment card industry compliance assessment including security controls 
                          and vulnerability scans.
                        </p>
                        <Button className="w-full bg-green-500 hover:bg-green-600">
                          <Download className="h-4 w-4 mr-2" />
                          Generate PCI Report
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-600">
                      <CardContent className="p-6">
                        <h3 className="text-white font-semibold mb-3">SOX-2 Controls</h3>
                        <p className="text-gray-300 text-sm mb-4">
                          Sarbanes-Oxley compliance report covering internal controls over 
                          financial reporting and data security.
                        </p>
                        <Button className="w-full bg-purple-500 hover:bg-purple-600">
                          <Download className="h-4 w-4 mr-2" />
                          Generate SOX Report
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800/50 border-gray-600">
                      <CardContent className="p-6">
                        <h3 className="text-white font-semibold mb-3">Data Inventory</h3>
                        <p className="text-gray-300 text-sm mb-4">
                          Complete inventory of personal data collection, processing, 
                          and retention across all systems.
                        </p>
                        <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
                          <Download className="h-4 w-4 mr-2" />
                          Generate Inventory
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-blue-500/10 border-blue-500/30">
                    <CardContent className="p-6">
                      <h3 className="text-blue-300 font-semibold mb-3">Automated Monitoring</h3>
                      <p className="text-blue-200 mb-4">
                        Our systems continuously monitor compliance status and will alert you to any issues.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-300">99.9%</div>
                          <div className="text-blue-400">Uptime SLA</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-300">24/7</div>
                          <div className="text-blue-400">Security Monitoring</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-300">30s</div>
                          <div className="text-blue-400">Incident Response</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};