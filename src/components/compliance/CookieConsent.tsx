import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, Settings, Info, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, can't be disabled
    functional: false,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    setPreferences(allAccepted);
    setShowBanner(false);
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    };
    localStorage.setItem('cookie-consent', JSON.stringify(necessaryOnly));
    setPreferences(necessaryOnly);
    setShowBanner(false);
  };

  const savePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    setShowBanner(false);
    setShowSettings(false);
  };

  const updatePreference = (key: keyof typeof preferences, value: boolean) => {
    if (key === 'necessary') return; // Necessary cookies can't be disabled
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/95 backdrop-blur-sm border-t border-purple-500/20">
        <Card className="max-w-4xl mx-auto bg-gray-900/90 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-yellow-400" />
                  <h3 className="text-white font-semibold text-lg">We value your privacy</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  We use cookies to enhance your experience, analyze site usage, and assist in marketing efforts. 
                  By continuing to use our site, you consent to our use of cookies in accordance with our 
                  <a href="/privacy-policy" className="text-yellow-400 hover:underline mx-1">Privacy Policy</a> 
                  and 
                  <a href="/cookie-policy" className="text-yellow-400 hover:underline mx-1">Cookie Policy</a>.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button 
                    onClick={acceptAll}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
                  >
                    Accept All
                  </Button>
                  <Button 
                    onClick={acceptNecessary}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Necessary Only
                  </Button>
                  <Dialog open={showSettings} onOpenChange={setShowSettings}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost"
                        className="text-gray-400 hover:text-white"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Cookie Settings
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-purple-500/30 text-white max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Settings className="h-5 w-5" />
                          Cookie Preferences
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        {Object.entries({
                          necessary: {
                            title: 'Necessary Cookies',
                            description: 'Essential for website functionality, security, and compliance. Cannot be disabled.',
                            required: true
                          },
                          functional: {
                            title: 'Functional Cookies',
                            description: 'Enable enhanced features like chat support and preference storage.',
                            required: false
                          },
                          analytics: {
                            title: 'Analytics Cookies',
                            description: 'Help us understand how visitors interact with our website.',
                            required: false
                          },
                          marketing: {
                            title: 'Marketing Cookies',
                            description: 'Used to deliver personalized ads and track campaign effectiveness.',
                            required: false
                          }
                        }).map(([key, config]) => (
                          <div key={key} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{config.title}</h4>
                                {config.required && (
                                  <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded">
                                    Required
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-400">{config.description}</p>
                            </div>
                            <Switch
                              checked={preferences[key as keyof typeof preferences]}
                              onCheckedChange={(checked) => updatePreference(key as keyof typeof preferences, checked)}
                              disabled={config.required}
                            />
                          </div>
                        ))}
                        <div className="flex justify-end gap-3 pt-4">
                          <Button variant="outline" onClick={() => setShowSettings(false)}>
                            Cancel
                          </Button>
                          <Button onClick={savePreferences} className="bg-yellow-400 hover:bg-yellow-500 text-black">
                            Save Preferences
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={acceptNecessary}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};