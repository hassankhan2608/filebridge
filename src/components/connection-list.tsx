import React from 'react';
import { Check, User, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ConnectionListProps {
  connections: string[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onPing: (id: string) => void;
}

export const ConnectionList: React.FC<ConnectionListProps> = ({
  connections,
  selectedId,
  onSelect,
  onPing,
}) => {
  if (connections.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No active connections</h3>
          <p className="text-sm text-muted-foreground max-w-[240px]">
            Share your ID with others to start transferring files
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-4">
      <AnimatePresence initial={false}>
        {connections.map((id) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={cn(
              'flex items-center gap-2 p-4 rounded-xl mb-2 transition-all',
              'bg-background border',
              selectedId === id 
                ? 'border-primary shadow-sm' 
                : 'border-border hover:border-primary/50'
            )}
          >
            <button
              onClick={() => onSelect(id)}
              className="flex items-center gap-3 min-w-0 flex-1"
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                selectedId === id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-primary/10 text-primary'
              )}>
                <User className="w-5 h-5" />
              </div>
              <span className="font-medium truncate">{id}</span>
              {selectedId === id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="w-5 h-5 flex-shrink-0 text-primary" />
                </motion.div>
              )}
            </button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onPing(id)}
                  className="flex-shrink-0"
                >
                  <Bell className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ping User</TooltipContent>
            </Tooltip>
          </motion.div>
        ))}
      </AnimatePresence>
    </ScrollArea>
  );
};