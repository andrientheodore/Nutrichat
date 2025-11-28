
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { Send, Loader2, Sparkles, Bot, User, Image as ImageIcon, Mic, X, StopCircle, Trash2, PanelRightClose } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string, image?: string, audio?: string, audioType?: string) => Promise<void>;
  onDeleteMessage: (id: string) => void;
  onClose?: () => void;
  isProcessing: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  onDeleteMessage,
  onClose,
  isProcessing 
}) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing, selectedImage]); 

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const resetInput = () => {
    setInput('');
    setSelectedImage(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedImage) || isProcessing) return;

    const text = input;
    const img = selectedImage;
    
    resetInput();

    await onSendMessage(text, img || undefined, undefined, undefined);
  };

  // --- Image Handling ---

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  // --- Audio Handling ---

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          await onSendMessage("", undefined, base64Audio, mimeType);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatMessageTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // --- UI Helpers ---

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // --- Text Formatting ---
  const renderFormattedText = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm z-10 flex-shrink-0 transition-colors">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mr-3">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">AI Assistant</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Powered by DeepSeek</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="hidden md:flex p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            title="Collapse Chat"
          >
            <PanelRightClose className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200">Welcome to NutriChat!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mt-2">
              Type a meal, upload a food photo, or record a voice note to track your nutrition.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`group flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
              
              <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                msg.role === 'user' 
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' 
                  : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
              }`}>
                {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
              </div>
              
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                {msg.image && (
                  <div className="mb-1 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm max-w-[200px]">
                    <img src={msg.image} alt="User upload" className="w-full h-auto object-cover" />
                  </div>
                )}
                
                {(msg.text || (!msg.image)) && (
                  <div className="relative group/bubble">
                    <div
                      className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none'
                      }`}
                    >
                      {msg.text ? renderFormattedText(msg.text) : (msg.role === 'user' ? '🎤 Audio Message' : '')}
                    </div>
                    
                    <button
                      onClick={() => onDeleteMessage(msg.id)}
                      className={`absolute top-1/2 -translate-y-1/2 p-1.5 text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full opacity-0 group-hover/bubble:opacity-100 transition-all ${
                        msg.role === 'user' ? '-left-10' : '-right-10'
                      }`}
                      title="Delete message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                  {formatMessageTime(msg.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start w-full">
            <div className="flex items-end gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <Bot className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex-shrink-0 pb-safe transition-colors">
        
        {selectedImage && (
          <div className="mb-3 relative inline-block">
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-0.5 shadow-md hover:bg-slate-700"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {isRecording ? (
           <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-3 animate-pulse">
             <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
               <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full animate-ping" />
               <span className="font-medium text-sm">Recording... {formatTime(recordingTime)}</span>
             </div>
             <button 
               onClick={stopRecording}
               className="p-2 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 rounded-full shadow-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
             >
               <StopCircle className="w-5 h-5 fill-current" />
             </button>
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex items-center gap-1 pb-1">
              <button 
                type="button"
                onClick={handleImageClick}
                disabled={isProcessing}
                className="p-3 md:p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors touch-manipulation"
                title="Attach Image"
              >
                <ImageIcon className="w-6 h-6 md:w-5 md:h-5" />
              </button>
              <button 
                type="button"
                onClick={startRecording}
                disabled={isProcessing}
                className="p-3 md:p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors touch-manipulation"
                title="Record Voice"
              >
                <Mic className="w-6 h-6 md:w-5 md:h-5" />
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={selectedImage ? "Describe this food..." : "Type a message..."}
              className="w-full p-3 pr-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none max-h-32 min-h-[46px] text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
              rows={1}
            />
            <button
              type="submit"
              disabled={(!input.trim() && !selectedImage) || isProcessing}
              className="absolute right-2 bottom-1.5 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
