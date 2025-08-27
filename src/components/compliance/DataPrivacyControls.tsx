import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Download, 
  Trash2, 
  Eye, 
  FileText, 
  UserX, 
  Database,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

export const DataPrivacyControls = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDataExport = async () => {
    setIsExporting(true);
    try {
      // Collect all user data for export
      const [profile, orders, rewards, biometrics] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user?.id).single(),
        supabase.from('orders').select('*, order_items(*)').eq('user_id', user?.id),
        supabase.from('user_rewards').select('*').eq('user_id', user?.id).single(),
        supabase.from('user_biometrics').select('*').eq('user_id', user?.id)
      ]);

      const exportData = {
        user_id: user?.id,
        email: user?.email,
        export_date: new Date().toISOString(),
        profile: profile.data,
        orders: orders.data,
        rewards: rewards.data,
        biometrics: biometrics.data,
        metadata: {
          export_type: 'GDPR_Article_20_Data_Portability',
          format: 'JSON',
          generated_by: 'pours+ Privacy Controls'
        }
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pours-plus-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Data Export Complete',
        description: 'Your personal data has been exported successfully.'
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Unable to export your data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleAccountDeletion = async () => {
    setIsDeleting(true);
    try {
      // Call edge function to handle account deletion
      const { error } = await supabase.functions.invoke('delete-user-account', {
        body: { userId: user?.id }
      });

      if (error) throw error;

      toast({
        title: 'Account Deletion Initiated',
        description: 'Your account deletion request has been submitted. You will receive a confirmation email.',
      });
      
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Deletion failed:', error);
      toast({
        title: 'Deletion Failed',
        description: 'Unable to process account deletion. Please contact support.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5" />
            Your Data Privacy Rights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-blue-500/30 bg-blue-500/10">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-blue-300">
              Under GDPR and CCPA, you have rights regarding your personal data. 
              Use the controls below to exercise these rights.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data Access & Export */}
            <Card className="bg-gray-800/50 border-gray-600">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Download className="h-6 w-6 text-blue-400" />
                  <h3 className="text-white font-semibold">Export Your Data</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Download a complete copy of your personal data in JSON format (GDPR Article 20).
                </p>
                <Button 
                  onClick={handleDataExport}
                  disabled={isExporting}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  {isExporting ? 'Exporting...' : 'Export My Data'}
                </Button>
              </CardContent>
            </Card>

            {/* Data Viewing */}
            <Card className="bg-gray-800/50 border-gray-600">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Eye className="h-6 w-6 text-green-400" />
                  <h3 className="text-white font-semibold">View Data Categories</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  See what personal information we collect and how it's used.
                </p>
                <Button 
                  variant="outline"
                  className="w-full border-green-500/30 text-green-300 hover:bg-green-500/10"
                >
                  View Data Types
                </Button>
              </CardContent>
            </Card>

            {/* Cookie Management */}
            <Card className="bg-gray-800/50 border-gray-600">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="h-6 w-6 text-yellow-400" />
                  <h3 className="text-white font-semibold">Cookie Preferences</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Manage your cookie and tracking preferences.
                </p>
                <Button 
                  variant="outline"
                  className="w-full border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                  onClick={() => localStorage.removeItem('cookie-consent')}
                >
                  Update Cookie Settings
                </Button>
              </CardContent>
            </Card>

            {/* Account Deletion */}
            <Card className="bg-gray-800/50 border-red-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <UserX className="h-6 w-6 text-red-400" />
                  <h3 className="text-white font-semibold">Delete Account</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Permanently delete your account and all associated data.
                </p>
                <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-red-500/30">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                        Confirm Account Deletion
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Alert className="border-red-500/30 bg-red-500/10">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-red-300">
                          This action cannot be undone. All your data, orders, rewards, and account 
                          information will be permanently deleted.
                        </AlertDescription>
                      </Alert>
                      <div className="flex justify-end gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowDeleteConfirm(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={handleAccountDeletion}
                          disabled={isDeleting}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Data Processing Information */}
          <Card className="bg-gray-800/30 border-gray-600">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Data Processing Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="text-gray-300 font-medium mb-2">Personal Data We Collect:</h4>
                  <ul className="text-gray-400 space-y-1">
                    <li>• Name, email, phone number</li>
                    <li>• Address and location data</li>
                    <li>• Payment information (encrypted)</li>
                    <li>• Order history and preferences</li>
                    <li>• Biometric data (if provided)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-gray-300 font-medium mb-2">How We Use Your Data:</h4>
                  <ul className="text-gray-400 space-y-1">
                    <li>• Process orders and payments</li>
                    <li>• Provide customer support</li>
                    <li>• Comply with legal obligations</li>
                    <li>• Improve our services</li>
                    <li>• Send promotional communications (with consent)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};