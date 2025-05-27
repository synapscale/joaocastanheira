"use client"
/**
 * Integração Multimodal
 * 
 * Este componente implementa suporte completo para entradas e saídas multimodais
 * (texto, imagem, áudio) no chat e em outras partes da aplicação.
 */

import { useState, useRef, useCallback } from "react"
import { 
  Image as ImageIcon, 
  Mic, 
  MicOff, 
  Play, 
  Square,
  Volume2,
  VolumeX,
  FileAudio,
  Download,
  Maximize,
  Minimize,
  X,
  Camera,
  Upload
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { showNotification } from "@/components/ui/notification"

// Tipos de mídia suportados
export type MediaType = "image" | "audio" | "video"

// Interface para um arquivo de mídia
export interface MediaFile {
  id: string
  type: MediaType
  name: string
  url: string
  thumbnail?: string
  size: number
  duration?: number
  width?: number
  height?: number
  createdAt: number
}

/**
 * Componente de captura de imagem
 */
export function ImageCapture({
  onCapture,
  maxWidth = 800,
  maxHeight = 600,
  quality = 0.8,
}: {
  onCapture: (file: File, dataUrl: string) => void
  maxWidth?: number
  maxHeight?: number
  quality?: number
}) {
  // Estados
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Referências
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  /**
   * Inicia a captura de vídeo
   */
  const startCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: maxWidth },
          height: { ideal: maxHeight },
          facingMode: "user",
        },
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCapturing(true)
      }
    } catch (error) {
      console.error("Erro ao acessar a câmera:", error)
      showNotification({
        type: "error",
        message: "Não foi possível acessar a câmera. Verifique as permissões.",
      })
    }
  }, [maxWidth, maxHeight])
  
  /**
   * Para a captura de vídeo
   */
  const stopCapture = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsCapturing(false)
    }
  }, [])
  
  /**
   * Captura uma imagem do vídeo
   */
  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      
      // Define as dimensões do canvas
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Desenha o frame atual do vídeo no canvas
      const context = canvas.getContext("2d")
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Converte para data URL
        const dataUrl = canvas.toDataURL("image/jpeg", quality)
        setCapturedImage(dataUrl)
        
        // Converte para File
        canvas.toBlob(blob => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, {
              type: "image/jpeg",
            })
            onCapture(file, dataUrl)
          }
        }, "image/jpeg", quality)
      }
      
      // Para a captura
      stopCapture()
    }
  }, [onCapture, quality, stopCapture])
  
  /**
   * Descarta a imagem capturada
   */
  const discardImage = useCallback(() => {
    setCapturedImage(null)
    startCapture()
  }, [startCapture])
  
  /**
   * Alterna o modo de tela cheia
   */
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])
  
  return (
    <div className={`relative rounded-lg overflow-hidden border ${
      isFullscreen ? "fixed inset-0 z-50 bg-background" : "w-full max-w-md mx-auto"
    }`}>
      {isFullscreen && (
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
      
      <div className="relative aspect-video bg-muted">
        {!isCapturing && !capturedImage ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Camera className="h-12 w-12 text-muted-foreground mb-2" />
            <Button onClick={startCapture}>Iniciar Câmera</Button>
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Imagem capturada"
            className="w-full h-full object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <div className="p-3 bg-muted/50 flex items-center justify-between">
        {capturedImage ? (
          <>
            <Button variant="ghost" size="sm" onClick={discardImage}>
              Descartar
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
              <Button variant="default" size="sm">
                Usar Imagem
              </Button>
            </div>
          </>
        ) : isCapturing ? (
          <>
            <Button variant="ghost" size="sm" onClick={stopCapture}>
              Cancelar
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
              <Button variant="default" size="sm" onClick={captureImage}>
                Capturar
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

/**
 * Componente de gravação de áudio
 */
export function AudioRecorder({
  onRecord,
  maxDuration = 60,
}: {
  onRecord: (file: File, duration: number) => void
  maxDuration?: number
}) {
  // Estados
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [volume, setVolume] = useState(0)
  
  // Referências
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  
  /**
   * Inicia a gravação de áudio
   */
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      // Configura o analisador de áudio para visualização
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      const analyser = audioContext.createAnalyser()
      analyserRef.current = analyser
      analyser.fftSize = 256
      
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      dataArrayRef.current = dataArray
      
      // Atualiza o volume a cada 100ms
      const updateVolume = () => {
        if (analyserRef.current && dataArrayRef.current) {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current)
          const average = dataArrayRef.current.reduce((a, b) => a + b, 0) / dataArrayRef.current.length
          setVolume(average / 256) // Normaliza para 0-1
        }
        
        if (isRecording && !isPaused) {
          requestAnimationFrame(updateVolume)
        }
      }
      
      // Configura o gravador
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        
        // Cria o arquivo
        const file = new File([audioBlob], `recording-${Date.now()}.wav`, {
          type: "audio/wav",
        })
        
        onRecord(file, duration)
      }
      
      // Inicia a gravação
      audioChunksRef.current = []
      mediaRecorder.start(100)
      setIsRecording(true)
      setIsPaused(false)
      
      // Inicia o timer
      let seconds = 0
      timerRef.current = setInterval(() => {
        seconds += 1
        setDuration(seconds)
        
        if (seconds >= maxDuration) {
          stopRecording()
        }
      }, 1000)
      
      // Inicia a visualização
      updateVolume()
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error)
      showNotification({
        type: "error",
        message: "Não foi possível acessar o microfone. Verifique as permissões.",
      })
    }
  }, [maxDuration, onRecord, isRecording, isPaused])
  
  /**
   * Pausa ou retoma a gravação
   */
  const togglePause = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording) return
    
    if (isPaused) {
      // Retoma a gravação
      mediaRecorderRef.current.resume()
      setIsPaused(false)
    } else {
      // Pausa a gravação
      mediaRecorderRef.current.pause()
      setIsPaused(true)
    }
  }, [isRecording, isPaused])
  
  /**
   * Para a gravação
   */
  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
      analyserRef.current = null
      dataArrayRef.current = null
    }
  }, [isRecording])
  
  /**
   * Descarta a gravação
   */
  const discardRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    
    setDuration(0)
    audioChunksRef.current = []
  }, [audioUrl])
  
  /**
   * Formata a duração em MM:SS
   */
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="p-4 bg-muted/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isRecording ? (
              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            ) : audioUrl ? (
              <FileAudio className="h-5 w-5 text-primary" />
            ) : (
              <Mic className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="font-medium">
              {isRecording ? "Gravando..." : audioUrl ? "Gravação concluída" : "Gravador de Áudio"}
            </span>
          </div>
          <span className="text-sm font-mono">
            {formatDuration(duration)} / {formatDuration(maxDuration)}
          </span>
        </div>
        
        {isRecording && (
          <div className="space-y-2 mb-4">
            <div className="h-8 bg-muted rounded-md overflow-hidden">
              <div
                className="h-full bg-primary/80 flex items-center justify-center transition-all"
                style={{ width: `${Math.min(100, (duration / maxDuration) * 100)}%` }}
              >
                <span className="text-xs text-primary-foreground font-medium">
                  {Math.round((duration / maxDuration) * 100)}%
                </span>
              </div>
            </div>
            
            <div className="h-12 bg-muted rounded-md overflow-hidden flex items-end p-1">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 mx-px bg-primary transition-all duration-100"
                  style={{
                    height: `${Math.random() * volume * 100}%`,
                    opacity: isPaused ? 0.3 : 0.8,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
        {audioUrl && (
          <div className="mb-4">
            <audio
              src={audioUrl}
              controls
              className="w-full"
            />
          </div>
        )}
        
        <div className="flex items-center justify-center gap-3">
          {!isRecording && !audioUrl ? (
            <Button
              variant="default"
              className="w-full"
              onClick={startRecording}
            >
              <Mic className="h-4 w-4 mr-2" />
              Iniciar Gravação
            </Button>
          ) : isRecording ? (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={togglePause}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              </Button>
              <Button
                variant="default"
                onClick={stopRecording}
              >
                <Square className="h-4 w-4 mr-2" />
                Parar Gravação
              </Button>
            </>
          ) : audioUrl ? (
            <>
              <Button
                variant="outline"
                onClick={discardRecording}
              >
                Descartar
              </Button>
              <Button
                variant="default"
              >
                <Download className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/**
 * Componente de upload de mídia
 */
export function MediaUpload({
  onUpload,
  accept = "image/*,audio/*,video/*",
  maxSize = 10 * 1024 * 1024, // 10MB
}: {
  onUpload: (file: File) => void
  accept?: string
  maxSize?: number
}) {
  // Estados
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  
  // Referência para o input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  /**
   * Manipula o evento de arrastar sobre o componente
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])
  
  /**
   * Manipula o evento de sair do arrasto
   */
  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])
  
  /**
   * Manipula o evento de soltar o arquivo
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])
  
  /**
   * Manipula a seleção de arquivos
   */
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }, [])
  
  /**
   * Processa os arquivos selecionados
   */
  const handleFiles = useCallback((fileList: FileList) => {
    const file = fileList[0]
    
    // Verifica o tamanho
    if (file.size > maxSize) {
      showNotification({
        type: "error",
        message: `Arquivo muito grande. O tamanho máximo é ${maxSize / 1024 / 1024}MB.`,
      })
      return
    }
    
    // Simula upload com progresso
    setIsUploading(true)
    setUploadProgress(0)
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          onUpload(file)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }, [maxSize, onUpload])
  
  /**
   * Abre o seletor de arquivos
   */
  const openFileSelector = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])
  
  /**
   * Formata o tamanho do arquivo
   */
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }
  
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={handleFileChange}
      />
      
      <div className="flex flex-col items-center justify-center text-center">
        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
        
        <h3 className="font-medium text-lg mb-1">
          {isDragging ? "Solte o arquivo aqui" : "Arraste e solte ou clique para upload"}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4">
          Suporta imagens, áudio e vídeo até {formatFileSize(maxSize)}
        </p>
        
        {isUploading ? (
          <div className="w-full max-w-xs">
            <Progress value={uploadProgress} className="h-2 mb-2" />
            <p className="text-xs text-center text-muted-foreground">
              Enviando... {uploadProgress}%
            </p>
          </div>
        ) : (
          <Button variant="default" onClick={openFileSelector}>
            Selecionar Arquivo
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Componente de entrada multimodal para o chat
 */
export function MultimodalInput({
  onSendMessage,
  onSendMedia,
}: {
  onSendMessage: (text: string) => void
  onSendMedia: (file: File, type: MediaType) => void
}) {
  // Estados
  const [text, setText] = useState("")
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"upload" | "camera" | "audio">("upload")
  
  /**
   * Envia uma mensagem de texto
   */
  const handleSendMessage = useCallback(() => {
    if (text.trim()) {
      onSendMessage(text.trim())
      setText("")
    }
  }, [text, onSendMessage])
  
  /**
   * Manipula o envio de mídia
   */
  const handleMediaUpload = useCallback((file: File) => {
    // Determina o tipo de mídia
    let type: MediaType = "image"
    
    if (file.type.startsWith("audio/")) {
      type = "audio"
    } else if (file.type.startsWith("video/")) {
      type = "video"
    }
    
    onSendMedia(file, type)
    setIsMediaDialogOpen(false)
  }, [onSendMedia])
  
  /**
   * Manipula a captura de imagem
   */
  const handleImageCapture = useCallback((file: File, dataUrl: string) => {
    onSendMedia(file, "image")
    setIsMediaDialogOpen(false)
  }, [onSendMedia])
  
  /**
   * Manipula a gravação de áudio
   */
  const handleAudioRecord = useCallback((file: File, duration: number) => {
    onSendMedia(file, "audio")
    setIsMediaDialogOpen(false)
  }, [onSendMedia])
  
  return (
    <div className="border-t bg-background p-4">
      <div className="flex items-end gap-2">
        <div className="flex-1 rounded-md border bg-background px-3 py-2 focus-within:ring-1 focus-within:ring-primary">
          <textarea
            className="w-full resize-none bg-transparent outline-none placeholder:text-muted-foreground"
            placeholder="Digite sua mensagem..."
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsMediaDialogOpen(true)}
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Adicionar mídia</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Button onClick={handleSendMessage} disabled={!text.trim()}>
          Enviar
        </Button>
      </div>
      
      <Dialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Mídia</DialogTitle>
            <DialogDescription>
              Envie imagens, grave áudio ou faça upload de arquivos para a conversa.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="upload" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="camera">Câmera</TabsTrigger>
              <TabsTrigger value="audio">Áudio</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="py-4">
              <MediaUpload onUpload={handleMediaUpload} />
            </TabsContent>
            
            <TabsContent value="camera" className="py-4">
              <ImageCapture onCapture={handleImageCapture} />
            </TabsContent>
            
            <TabsContent value="audio" className="py-4">
              <AudioRecorder onRecord={handleAudioRecord} />
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMediaDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * Componente de visualização de mídia em mensagens
 */
export function MediaViewer({
  media,
  onDownload,
}: {
  media: MediaFile
  onDownload?: (media: MediaFile) => void
}) {
  // Estados
  const [isExpanded, setIsExpanded] = useState(false)
  
  /**
   * Alterna o modo expandido
   */
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])
  
  /**
   * Manipula o download da mídia
   */
  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload(media)
    } else {
      // Download padrão
      const a = document.createElement("a")
      a.href = media.url
      a.download = media.name
      a.click()
    }
  }, [media, onDownload])
  
  /**
   * Formata o tamanho do arquivo
   */
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }
  
  /**
   * Formata a duração
   */
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "--:--"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  
  // Renderiza com base no tipo de mídia
  if (media.type === "image") {
    return (
      <div className={`relative rounded-lg overflow-hidden border ${
        isExpanded ? "fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4" : "max-w-sm"
      }`}>
        {isExpanded && (
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDownload}
            >
              <Download className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleExpanded}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        <img
          src={media.url}
          alt={media.name}
          className={`w-full ${isExpanded ? "max-h-full object-contain" : "cursor-pointer"}`}
          onClick={isExpanded ? undefined : toggleExpanded}
        />
        
        {!isExpanded && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm"
              onClick={toggleExpanded}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    )
  }
  
  if (media.type === "audio") {
    return (
      <div className="rounded-lg border overflow-hidden max-w-sm">
        <div className="p-3 bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileAudio className="h-5 w-5 text-primary" />
            <span className="font-medium truncate max-w-[150px]">{media.name}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatDuration(media.duration)} • {formatFileSize(media.size)}
          </span>
        </div>
        
        <audio
          src={media.url}
          controls
          className="w-full"
        />
        
        <div className="p-2 bg-muted/30 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>
    )
  }
  
  if (media.type === "video") {
    return (
      <div className={`relative rounded-lg overflow-hidden border ${
        isExpanded ? "fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4" : "max-w-sm"
      }`}>
        {isExpanded && (
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDownload}
            >
              <Download className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleExpanded}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        <video
          src={media.url}
          controls
          className="w-full"
          poster={media.thumbnail}
        />
        
        {!isExpanded && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm"
              onClick={toggleExpanded}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    )
  }
  
  return null
}
