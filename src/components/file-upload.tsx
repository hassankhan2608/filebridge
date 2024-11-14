import React from 'react';
import { Button } from '@/components/ui/button';
import { X, FileIcon, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

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
              className="flex items-center gap-4 p-4 rounded-lg mb-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
            >
              <div className="w-10 h-10 rounded-lg bg-[#044cab]/10 flex items-center justify-center flex-shrink-0">
                <FileIcon className="w-5 h-5 text-[#044cab]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {formatFileSize(file.size)}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveFile(index)}
                className="flex-shrink-0 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
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
            "border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer",
            "hover:border-[#044cab] hover:bg-[#044cab]/5",
            isDragActive && "border-[#044cab] bg-[#044cab]/5",
            "flex flex-col items-center justify-center text-center"
          )}
        >
          <input {...getInputProps()} />
          <Upload className={cn(
            "w-8 h-8 mb-4 transition-colors",
            isDragActive ? "text-[#044cab]" : "text-gray-400"
          )} />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {isDragActive ? (
              "Drop files here"
            ) : (
              "Drag & drop files here, or click to select"
            )}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Supported files: Any file type
          </p>
        </div>

        {files.length > 0 && (
          <Button
            className="w-full h-12 text-base bg-[#044cab] hover:bg-[#033b8a] text-white"
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