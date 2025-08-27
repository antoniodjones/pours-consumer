import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const AvatarUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.user_metadata?.avatar_url || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user metadata with new avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: data.publicUrl }
      });

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(data.publicUrl);
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload avatar",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setUploading(true);

      // Remove from user metadata
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      });

      if (error) {
        throw error;
      }

      // Delete from storage if it exists
      if (avatarUrl && user?.id) {
        const filePath = `${user.id}/avatar.jpg`; // Assuming jpg, but this could be improved
        await supabase.storage.from('avatars').remove([filePath]);
      }

      setAvatarUrl(null);
      toast({
        title: "Avatar Removed",
        description: "Your profile picture has been removed.",
      });
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast({
        title: "Remove Failed",
        description: error instanceof Error ? error.message : "Failed to remove avatar",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const getDisplayName = () => {
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    if (user?.email) {
      return user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1);
    }
    return 'User';
  };

  return (
    <Card className="bg-black/40 backdrop-blur-sm border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Camera className="h-5 w-5" />
          Profile Picture
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-32 w-32 border-4 border-purple-400/30">
            <AvatarImage 
              src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
              alt="Profile picture" 
            />
            <AvatarFallback className="bg-purple-600 text-white text-2xl font-semibold">
              {getDisplayName().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={triggerFileSelect}
              disabled={uploading}
              className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload New'}
            </Button>

            {avatarUrl && (
              <Button
                onClick={removeAvatar}
                disabled={uploading}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
            className="hidden"
          />

          <p className="text-xs text-gray-400 text-center max-w-sm">
            Upload a profile picture to personalize your account. Supported formats: JPG, PNG, GIF. Max size: 5MB.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};