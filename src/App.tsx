import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { startPeer, stopPeerSession } from "./store/peer/peerActions";
import * as connectionAction from "./store/connection/connectionActions";
import { DataType, PeerConnection } from "./helpers/peer";
import { useAsyncState } from "./helpers/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { FileUpload } from "@/components/file-upload";
import { ConnectionList } from "@/components/connection-list";
import { ShareOptions } from "@/components/share-options";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Github, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from "@/components/ui/separator";

const App: React.FC = () => {
  const peer = useAppSelector((state) => state.peer);
  const connection = useAppSelector((state) => state.connection);
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connectId = params.get('connect');
    
    if (!peer.started && !peer.loading) {
      dispatch(startPeer()).then(() => {
        if (connectId) {
          dispatch(connectionAction.connectPeer(connectId));
          window.history.replaceState({}, '', window.location.pathname);
        }
      });
    }
  }, []);

  const handleResetSession = async () => {
    await PeerConnection.closePeerSession();
    dispatch(stopPeerSession());
    dispatch(startPeer());
  };

  const handleConnectOtherPeer = () => {
    if (connection.id) {
      dispatch(connectionAction.connectPeer(connection.id));
    } else {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Please enter a peer ID to connect",
      });
    }
  };

  const [fileList, setFileList] = useAsyncState([] as File[]);
  const [sendLoading, setSendLoading] = useAsyncState(false);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "Please select a file to send",
      });
      return;
    }
    if (!connection.selectedId) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Please select a connection",
      });
      return;
    }
    try {
      await setSendLoading(true);
      for (const file of fileList) {
        const blob = new Blob([file], { type: file.type });
        await PeerConnection.sendConnection(connection.selectedId, {
          dataType: DataType.FILE,
          file: blob,
          fileName: file.name,
          fileType: file.type,
        });
      }
      await setSendLoading(false);
      await setFileList([]);
      toast({
        title: "Success",
        description: `${fileList.length} file${fileList.length === 1 ? '' : 's'} sent successfully`,
        className: "bg-[#044cab] text-white",
      });
    } catch (err) {
      await setSendLoading(false);
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send files",
      });
    }
  };

  const handlePing = async (id: string) => {
    try {
      await PeerConnection.sendConnection(id, {
        dataType: DataType.PING,
        message: 'PING',
      });
      toast({
        title: "Ping sent",
        description: "Notification sent to the user",
        className: "bg-[#044cab] text-white",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send ping",
      });
    }
  };

  const handleRemoveFile = async (index: number) => {
    const newFiles = fileList.filter((_, i) => i !== index);
    await setFileList(newFiles);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:bg-gray-950/80 dark:border-gray-800">
        <nav className="container flex h-16 items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <a
              href="https://github.com/hassankhan2608/filebridge.git"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-xl font-bold text-[#044cab] dark:text-blue-400">
              FileBridge
            </h1>
          </motion.div>
          <ThemeToggle />
        </nav>
      </header>

      <main className="container py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Your Connection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <ShareOptions peerId={peer.id || ''} onReset={handleResetSession} />
                
                <div className="grid gap-4">
                  <Input
                    placeholder="Enter peer ID to connect"
                    onChange={(e) =>
                      dispatch(connectionAction.changeConnectionInput(e.target.value))
                    }
                  />
                  <Button
                    onClick={handleConnectOtherPeer}
                    disabled={connection.loading}
                    className="w-full bg-[#044cab] hover:bg-[#033b8a] text-white h-11"
                  >
                    {connection.loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect to Peer'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="h-[600px]">
                <CardHeader>
                  <CardTitle>Active Connections</CardTitle>
                </CardHeader>
                <CardContent>
                  <ConnectionList
                    connections={connection.list}
                    selectedId={connection.selectedId}
                    onSelect={(id) => dispatch(connectionAction.selectItem(id))}
                    onPing={handlePing}
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="h-[600px]">
                <CardHeader>
                  <CardTitle>File Transfer</CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUpload
                    files={fileList}
                    onFilesChange={setFileList}
                    loading={sendLoading}
                    onUpload={handleUpload}
                    onRemoveFile={handleRemoveFile}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
};

export default App;