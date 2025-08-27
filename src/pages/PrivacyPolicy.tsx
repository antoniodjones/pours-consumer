import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Lock, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="text-white hover:text-yellow-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white text-3xl flex items-center gap-3">
                <Shield className="h-8 w-8 text-yellow-400" />
                Privacy Policy
              </CardTitle>
              <p className="text-gray-300">Last updated: {new Date().toLocaleDateString()}</p>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none space-y-8">
              
              {/* Introduction */}
              <section>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                  <Eye className="h-5 w-5" />
                  Introduction
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  At pours+ ("we," "our," or "us"), we respect your privacy and are committed to protecting your personal data. 
                  This privacy policy explains how we collect, use, and safeguard your information when you use our services, 
                  in compliance with the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), 
                  and other applicable privacy laws.
                </p>
              </section>

              {/* Data Collection */}
              <section>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5" />
                  Information We Collect
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-yellow-400 mb-2">Personal Information:</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      <li>Name, email address, phone number</li>
                      <li>Date of birth (for age verification)</li>
                      <li>Postal address for delivery</li>
                      <li>Payment information (processed securely via encrypted third-party providers)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-yellow-400 mb-2">Usage Data:</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      <li>Order history and preferences</li>
                      <li>Website interaction data</li>
                      <li>Device information and IP address</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-yellow-400 mb-2">Biometric Data (Optional):</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      <li>Health metrics for responsible consumption monitoring</li>
                      <li>Only collected with explicit consent</li>
                      <li>Encrypted and stored separately from other data</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* How We Use Data */}
              <section>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                  <Lock className="h-5 w-5" />
                  How We Use Your Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gray-800/50 border-gray-600">
                    <CardContent className="p-4">
                      <h3 className="text-yellow-400 font-medium mb-2">Service Delivery</h3>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Process orders and payments</li>
                        <li>• Deliver products and services</li>
                        <li>• Provide customer support</li>
                        <li>• Send order confirmations and updates</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-600">
                    <CardContent className="p-4">
                      <h3 className="text-yellow-400 font-medium mb-2">Legal Compliance</h3>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Age verification for alcohol purchases</li>
                        <li>• Comply with tax and regulatory requirements</li>
                        <li>• Prevent fraud and ensure security</li>
                        <li>• Respond to legal requests</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-600">
                    <CardContent className="p-4">
                      <h3 className="text-yellow-400 font-medium mb-2">Service Improvement</h3>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Analyze usage patterns</li>
                        <li>• Improve website functionality</li>
                        <li>• Develop new features</li>
                        <li>• Personalize user experience</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800/50 border-gray-600">
                    <CardContent className="p-4">
                      <h3 className="text-yellow-400 font-medium mb-2">Marketing (With Consent)</h3>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>• Send promotional emails</li>
                        <li>• Loyalty program communications</li>
                        <li>• Special offers and updates</li>
                        <li>• Targeted advertising</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Your Privacy Rights</h2>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                  <h3 className="text-blue-300 font-medium mb-4">Under GDPR and CCPA, you have the right to:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="text-gray-300 space-y-2">
                      <li>✓ Access your personal data</li>
                      <li>✓ Correct inaccurate information</li>
                      <li>✓ Delete your data ("right to be forgotten")</li>
                      <li>✓ Data portability (export your data)</li>
                    </ul>
                    <ul className="text-gray-300 space-y-2">
                      <li>✓ Object to processing</li>
                      <li>✓ Restrict processing</li>
                      <li>✓ Withdraw consent</li>
                      <li>✓ Lodge a complaint with supervisory authorities</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Data Security */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Data Security</h2>
                <p className="text-gray-300 mb-4">
                  We implement industry-standard security measures to protect your personal data:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-green-500/10 border-green-500/30">
                    <CardContent className="p-4 text-center">
                      <Shield className="h-8 w-8 text-green-400 mx-auto mb-2" />
                      <h3 className="text-green-300 font-medium mb-2">Encryption</h3>
                      <p className="text-gray-300 text-sm">All data transmitted and stored using AES-256 encryption</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-500/10 border-purple-500/30">
                    <CardContent className="p-4 text-center">
                      <Lock className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                      <h3 className="text-purple-300 font-medium mb-2">Access Controls</h3>
                      <p className="text-gray-300 text-sm">Role-based access with multi-factor authentication</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-yellow-500/10 border-yellow-500/30">
                    <CardContent className="p-4 text-center">
                      <Eye className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                      <h3 className="text-yellow-300 font-medium mb-2">Monitoring</h3>
                      <p className="text-gray-300 text-sm">24/7 security monitoring and audit logging</p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Cookies and Tracking</h2>
                <p className="text-gray-300 mb-4">
                  We use cookies and similar technologies to enhance your experience. You can manage your cookie 
                  preferences through our cookie consent banner or browser settings.
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-300 text-sm">
                    <strong>Note:</strong> Disabling certain cookies may affect website functionality and your ability to place orders.
                  </p>
                </div>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Contact Us</h2>
                <p className="text-gray-300 mb-4">
                  For privacy-related questions or to exercise your rights, contact us:
                </p>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                    <div>
                      <strong>Data Protection Officer</strong><br />
                      Email: privacy@pours-plus.com<br />
                      Phone: 1-800-PRIVACY
                    </div>
                    <div>
                      <strong>Mailing Address</strong><br />
                      pours+ Privacy Team<br />
                      123 Digital Ave<br />
                      Tech City, TC 12345
                    </div>
                  </div>
                </div>
              </section>

              {/* Updates */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Policy Updates</h2>
                <p className="text-gray-300">
                  We may update this privacy policy periodically. We will notify you of significant changes 
                  via email or through our website. Continued use of our services after changes indicates 
                  your acceptance of the updated policy.
                </p>
              </section>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;