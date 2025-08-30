"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Camera, Mic, Wifi, Monitor } from "lucide-react"

interface TestResult {
  status: "pending" | "testing" | "passed" | "failed"
  message: string
  details?: string
}

interface VideoQualityTestProps {
  onTestComplete: (allPassed: boolean) => void
}

export function VideoQualityTest({ onTestComplete }: VideoQualityTestProps) {
  const [currentTest, setCurrentTest] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({
    camera: { status: "pending", message: "Camera test pending" },
    microphone: { status: "pending", message: "Microphone test pending" },
    internet: { status: "pending", message: "Internet speed test pending" },
    browser: { status: "pending", message: "Browser compatibility check pending" },
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const updateTestResult = (testName: string, result: TestResult) => {
    setTestResults((prev) => ({
      ...prev,
      [testName]: result,
    }))
  }

  const testCamera = async () => {
    setCurrentTest("camera")
    updateTestResult("camera", { status: "testing", message: "Testing camera access..." })

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      // Test video quality
      const videoTrack = stream.getVideoTracks()[0]
      const settings = videoTrack.getSettings()

      if (settings.width && settings.height && settings.width >= 640 && settings.height >= 480) {
        updateTestResult("camera", {
          status: "passed",
          message: "Camera test passed",
          details: `Resolution: ${settings.width}x${settings.height}`,
        })
      } else {
        updateTestResult("camera", {
          status: "failed",
          message: "Camera resolution too low",
          details: "Minimum 640x480 required for RON sessions",
        })
      }
    } catch (error) {
      updateTestResult("camera", {
        status: "failed",
        message: "Camera access denied or unavailable",
        details: "Please allow camera access and ensure no other applications are using it",
      })
    }
  }

  const testMicrophone = async () => {
    setCurrentTest("microphone")
    updateTestResult("microphone", { status: "testing", message: "Testing microphone..." })

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext

      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      microphone.connect(analyser)

      analyser.fftSize = 256
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      // Test for 3 seconds
      let maxVolume = 0
      const testDuration = 3000
      const startTime = Date.now()

      const checkAudio = () => {
        analyser.getByteFrequencyData(dataArray)
        const volume = Math.max(...dataArray)
        maxVolume = Math.max(maxVolume, volume)

        if (Date.now() - startTime < testDuration) {
          requestAnimationFrame(checkAudio)
        } else {
          stream.getTracks().forEach((track) => track.stop())
          audioContext.close()

          if (maxVolume > 50) {
            updateTestResult("microphone", {
              status: "passed",
              message: "Microphone test passed",
              details: `Audio level detected: ${Math.round(maxVolume)}/255`,
            })
          } else {
            updateTestResult("microphone", {
              status: "failed",
              message: "Microphone level too low",
              details: "Please speak into your microphone or check volume settings",
            })
          }
        }
      }

      checkAudio()
    } catch (error) {
      updateTestResult("microphone", {
        status: "failed",
        message: "Microphone access denied or unavailable",
        details: "Please allow microphone access for RON sessions",
      })
    }
  }

  const testInternetSpeed = async () => {
    setCurrentTest("internet")
    updateTestResult("internet", { status: "testing", message: "Testing internet speed..." })

    try {
      const startTime = Date.now()
      const response = await fetch("https://httpbin.org/bytes/1000000", { cache: "no-cache" })
      const endTime = Date.now()

      if (response.ok) {
        const duration = (endTime - startTime) / 1000
        const speedMbps = (8 / duration).toFixed(1) // 1MB = 8Mbits

        if (Number.parseFloat(speedMbps) >= 2) {
          updateTestResult("internet", {
            status: "passed",
            message: "Internet speed sufficient",
            details: `Download speed: ${speedMbps} Mbps`,
          })
        } else {
          updateTestResult("internet", {
            status: "failed",
            message: "Internet speed too slow",
            details: `Speed: ${speedMbps} Mbps (minimum 2 Mbps required)`,
          })
        }
      }
    } catch (error) {
      updateTestResult("internet", {
        status: "failed",
        message: "Unable to test internet speed",
        details: "Please check your internet connection",
      })
    }
  }

  const testBrowserCompatibility = () => {
    setCurrentTest("browser")
    updateTestResult("browser", { status: "testing", message: "Checking browser compatibility..." })

    const checks = {
      webrtc: !!window.RTCPeerConnection,
      mediaDevices: !!navigator.mediaDevices,
      getUserMedia: !!navigator.mediaDevices?.getUserMedia,
      webgl: !!document.createElement("canvas").getContext("webgl"),
    }

    const failedChecks = Object.entries(checks).filter(([_, passed]) => !passed)

    if (failedChecks.length === 0) {
      updateTestResult("browser", {
        status: "passed",
        message: "Browser fully compatible",
        details: "All required features supported",
      })
    } else {
      updateTestResult("browser", {
        status: "failed",
        message: "Browser compatibility issues",
        details: `Missing: ${failedChecks.map(([feature]) => feature).join(", ")}`,
      })
    }
  }

  const runAllTests = async () => {
    await testCamera()
    await testMicrophone()
    await testInternetSpeed()
    testBrowserCompatibility()
    setCurrentTest(null)
  }

  const stopAllStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
  }

  useEffect(() => {
    return () => {
      stopAllStreams()
    }
  }, [])

  useEffect(() => {
    const allTests = Object.values(testResults)
    const completedTests = allTests.filter((test) => test.status === "passed" || test.status === "failed")
    const passedTests = allTests.filter((test) => test.status === "passed")

    if (completedTests.length === allTests.length) {
      onTestComplete(passedTests.length === allTests.length)
    }
  }, [testResults, onTestComplete])

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "testing":
        return <AlertCircle className="h-5 w-5 text-yellow-600 animate-pulse" />
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300" />
    }
  }

  const getTestIcon = (testName: string) => {
    switch (testName) {
      case "camera":
        return <Camera className="h-5 w-5" />
      case "microphone":
        return <Mic className="h-5 w-5" />
      case "internet":
        return <Wifi className="h-5 w-5" />
      case "browser":
        return <Monitor className="h-5 w-5" />
      default:
        return null
    }
  }

  const completedTests = Object.values(testResults).filter(
    (test) => test.status === "passed" || test.status === "failed",
  ).length
  const totalTests = Object.keys(testResults).length
  const progress = (completedTests / totalTests) * 100

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Technical Setup Validation
          </CardTitle>
          <CardDescription>
            We'll test your camera, microphone, and internet connection to ensure the best RON experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Preview */}
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full max-w-md mx-auto rounded-lg bg-gray-100"
              autoPlay
              muted
              playsInline
            />
            {!streamRef.current && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <Camera className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Camera preview will appear here</p>
                </div>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Test Progress</span>
              <span>
                {completedTests}/{totalTests} completed
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Test Results */}
          <div className="grid gap-4">
            {Object.entries(testResults).map(([testName, result]) => (
              <div key={testName} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getTestIcon(testName)}
                  <div>
                    <div className="font-medium capitalize">{testName} Test</div>
                    <div className="text-sm text-gray-600">{result.message}</div>
                    {result.details && <div className="text-xs text-gray-500 mt-1">{result.details}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {result.status !== "pending" && (
                    <Badge variant={result.status === "passed" ? "default" : "destructive"}>{result.status}</Badge>
                  )}
                  {getStatusIcon(result.status)}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={runAllTests} disabled={currentTest !== null} className="flex-1">
              {currentTest ? "Testing..." : "Run All Tests"}
            </Button>
            {streamRef.current && (
              <Button variant="outline" onClick={stopAllStreams}>
                Stop Camera
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <strong>Tips for best results:</strong>
            <ul className="mt-1 space-y-1 list-disc list-inside">
              <li>Ensure good lighting for camera visibility</li>
              <li>Test in a quiet environment</li>
              <li>Close other video applications</li>
              <li>Use a stable internet connection</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
