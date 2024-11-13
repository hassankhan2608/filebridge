import React from 'react';
import { Button } from '@/components/ui/button';
import { X, FileIcon, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => Promise<void>;
  loading: boolean;
  onUpload: () => void;
  onRemoveFile: (index: number) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFilesChange,
  loading,
  onUpload,
  onRemoveFile,
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      await onFilesChange([...files, ...acceptedFiles]);
    },
  });

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 w-full pr-4 mb-4">
        <AnimatePresence initial={false}>
          {files.map((file, index) => (
            <motion.div
              key={`${file.name}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl mb-2",
                "bg-background border border-border"
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveFile(index)}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </ScrollArea>

      <div className="space-y-4 flex-shrink-0">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 transition-colors cursor-pointer",
            "hover:border-primary/50 hover:bg-accent/50",
            isDragActive && "border-primary bg-accent",
            "flex flex-col items-center justify-center text-center"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-1">
            {isDragActive ? (
              "Drop files here"
            ) : (
              "Drag & drop files here, or click to select"
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            Supported files: Any file type
          </p>
        </div>

        {files.length > 0 && (
          <Button
            className="w-full h-12 text-base"
            onClick={onUpload}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              `Send ${files.length} File${files.length === 1 ? '' : 's'}`
            )}
          </Button>
        )}
      </div>
    </div>
  );
};