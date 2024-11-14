import React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Copy, Share2, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { generateUsername } from '@/lib/username-generator';

interface ShareOptionsProps {
  peerId: string;
  onReset: () => void;
}

export const ShareOptions: React.FC<ShareOptionsProps> = ({ peerId, onReset }) => {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  const shareLink = `${window.location.origin}?connect=${peerId}`;
  const username = generateUsername(peerId);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
      className: "bg-[#044cab] text-white",
    });
  };

  const ShareContent = (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Identity</h3>
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 space-y-2">
            <div className="text-lg font-semibold">{username}</div>
            <div className="flex items-center gap-2">
              <code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm font-mono">
                {peerId}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(peerId)}
                className="h-8"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Share Link</h3>
          <div className="flex items-center gap-2">
            <Input
              value={shareLink}
              readOnly
              className="font-mono text-sm bg-gray-50 dark:bg-gray-900"
            />
            <Button
              variant="outline"
              onClick={() => copyToClipboard(shareLink)}
              className="shrink-0"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">QR Code</h3>
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-xl">
            <QRCodeSVG value={shareLink} size={200} />
          </div>
        </div>
      </div>
    </div>
  );

  const ConnectionInfo = (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{username}</h2>
          <Badge variant="outline" className="font-mono text-xs">
            {peerId.slice(0, 8)}...
          </Badge>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Share your ID to connect with others
        </p>
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        {isDesktop ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 md:flex-none bg-[#044cab] hover:bg-[#033b8a] text-white">
                <Share2 className="w-4 h-4 mr-2" />
                Share Connection
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share Connection</DialogTitle>
              </DialogHeader>
              {ShareContent}
            </DialogContent>
          </Dialog>
        ) : (
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button className="flex-1 md:flex-none bg-[#044cab] hover:bg-[#033b8a] text-white">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Share Connection</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-8">
                {ShareContent}
              </div>
            </DrawerContent>
          </Drawer>
        )}
        <Button
          variant="outline"
          onClick={onReset}
          className="flex-1 md:flex-none"
        >
          <RotateCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );

  return ConnectionInfo;
};