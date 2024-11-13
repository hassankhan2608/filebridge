import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { startPeer, stopPeerSession } from "./store/peer/peerActions";
import * as connectionAction from "./store/connection/connectionActions";
import { DataType, PeerConnection } from "./helpers/peer";
import { useAsyncState } from "./helpers/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { FileUpload } from "@/components/file-upload";
import { ConnectionList } from "@/components/connection-list";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Copy, Github, RotateCw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const App: React.FC = () => {
  const peer = useAppSelector((state) => state.peer);
  const connection = useAppSelector((state) => state.connection);
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  useEffect(() => {
    if (!peer.started && !peer.loading) {
      dispatch(startPeer());
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
  const [pingAlert, setPingAlert] = useAsyncState({ show: false, from: '' });

  useEffect(() => {
    if (pingAlert.show) {
      const timer = setTimeout(() => {
        setPingAlert({ show: false, from: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [pingAlert.show]);

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
      });
    } catch (err) {
      await setSendLoading(false);
      console.log(err);
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
      });
    } catch (err) {
      console.log(err);
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

  useEffect(() => {
    const handlePingReceived = (peerId: string) => {
      setPingAlert({ show: true, from: peerId });
      toast({
        title: "Ping Received!",
        description: `User ${peerId} is trying to get your attention`,
        variant: "default",
        className: "bg-primary text-primary-foreground",
      });
    };

    PeerConnection.onPingReceived(handlePingReceived);

    return () => {
      PeerConnection.removePingListener(handlePingReceived);
    };
  }, []);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
        <AnimatePresence>
          {pingAlert.show && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
            >
              <Card className="border-primary bg-primary text-primary-foreground">
                <CardContent className="p-4 text-center">
                  <h3 className="text-xl font-semibold mb-2">Incoming Ping!</h3>
                  <p className="text-lg opacity-90">
                    User {pingAlert.from} is trying to get your attention
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <motion.a
              href="https://github.com/yourusername/filebridge"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="w-5 h-5" />
            </motion.a>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text"
            >
              FILE BRIDGE
            </motion.h1>
            <ThemeToggle />
          </div>
        </header>

        <main className="container py-6 md:py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="backdrop-blur-sm bg-card/50">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-background rounded-xl">
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Your ID</p>
                        <div className="flex items-center gap-2">
                          {peer.loading ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Generating...</span>
                            </div>
                          ) : (
                            <code className="text-base md:text-lg font-mono text-primary break-all">
                              {peer.id}
                            </code>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={async () => {
                                await navigator.clipboard.writeText(peer.id || "");
                                toast({
                                  title: "Copied!",
                                  description: "ID copied to clipboard",
                                });
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy ID</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={handleResetSession}
                              disabled={peer.loading}
                            >
                              <RotateCw className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Reset Session</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-2">
                      <Input
                        placeholder="Enter peer ID to connect"
                        className="flex-1 bg-background"
                        onChange={(e) =>
                          dispatch(connectionAction.changeConnectionInput(e.target.value))
                        }
                      />
                      <Button
                        onClick={handleConnectOtherPeer}
                        disabled={connection.loading}
                        className="md:w-32"
                      >
                        {connection.loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Connecting
                          </>
                        ) : (
                          'Connect'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="backdrop-blur-sm bg-card/50 h-[600px]">
                  <CardContent className="p-6 h-full">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Active Connections</h2>
                        <div className="text-sm text-muted-foreground">
                          {connection.list.length} connected
                        </div>
                      </div>
                      <div className="flex-1 min-h-0">
                        <ConnectionList
                          connections={connection.list}
                          selectedId={connection.selectedId}
                          onSelect={(id) => dispatch(connectionAction.selectItem(id))}
                          onPing={handlePing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="backdrop-blur-sm bg-card/50 h-[600px]">
                  <CardContent className="p-6 h-full">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Send Files</h2>
                      </div>
                      <div className="flex-1 min-h-0">
                        <FileUpload
                          files={fileList}
                          onFilesChange={setFileList}
                          loading={sendLoading}
                          onUpload={handleUpload}
                          onRemoveFile={handleRemoveFile}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
        <Toaster />
      </div>
    </TooltipProvider>
  );
};

export default App;