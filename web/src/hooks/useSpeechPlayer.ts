import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { NarrationUtterance } from '../lib/narration'

const RATE_KEY = 'isc-listen-rate'
const VOICE_KEY = 'isc-listen-voice'

export type SpeechStatus = 'idle' | 'playing' | 'paused' | 'waiting'

function loadRate(): number {
  try {
    const v = Number(localStorage.getItem(RATE_KEY))
    if (v === 0.85 || v === 1 || v === 1.25) return v
  } catch {
    /* ignore */
  }
  return 1
}

function loadVoiceUri(): string {
  try {
    return localStorage.getItem(VOICE_KEY) ?? ''
  } catch {
    return ''
  }
}

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function useSpeechPlayer(utterances: NarrationUtterance[]) {
  const [index, setIndex] = useState(0)
  const [status, setStatus] = useState<SpeechStatus>('idle')
  const [rate, setRateState] = useState(loadRate)
  const [voiceUri, setVoiceUriState] = useState(loadVoiceUri)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const indexRef = useRef(0)
  const statusRef = useRef<SpeechStatus>('idle')
  const utterancesRef = useRef(utterances)
  const rateRef = useRef(rate)
  const voiceUriRef = useRef(voiceUri)

  useEffect(() => {
    utterancesRef.current = utterances
    indexRef.current = 0
    setIndex(0)
    window.speechSynthesis?.cancel()
    setStatus('idle')
    statusRef.current = 'idle'
  }, [utterances])

  useEffect(() => {
    rateRef.current = rate
  }, [rate])
  useEffect(() => {
    voiceUriRef.current = voiceUri
  }, [voiceUri])

  useEffect(() => {
    if (!speechSupported()) return
    const load = () => {
      const list = window.speechSynthesis.getVoices()
      const en = list.filter((v) => /en/i.test(v.lang))
      setVoices(en.length ? en : list)
    }
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [])

  const pickVoice = useCallback((): SpeechSynthesisVoice | null => {
    const list = voices.length ? voices : window.speechSynthesis.getVoices()
    if (!list.length) return null
    if (voiceUriRef.current) {
      const found = list.find((v) => v.voiceURI === voiceUriRef.current)
      if (found) return found
    }
    return (
      list.find((v) => /en-US/i.test(v.lang) && /natural|premium|enhanced|samantha|google/i.test(v.name)) ||
      list.find((v) => /en-US/i.test(v.lang)) ||
      list.find((v) => /en/i.test(v.lang)) ||
      list[0]
    )
  }, [voices])

  const speakAt = useCallback(
    (i: number) => {
      if (!speechSupported()) return
      const list = utterancesRef.current
      if (i < 0 || i >= list.length) {
        window.speechSynthesis.cancel()
        setStatus('idle')
        statusRef.current = 'idle'
        return
      }
      const u = list[i]
      indexRef.current = i
      setIndex(i)

      if (u.waitForNext) {
        window.speechSynthesis.cancel()
        // Speak the pause prompt, then wait
        const utter = new SpeechSynthesisUtterance(u.text)
        utter.rate = rateRef.current
        const voice = pickVoice()
        if (voice) utter.voice = voice
        utter.onend = () => {
          setStatus('waiting')
          statusRef.current = 'waiting'
        }
        setStatus('playing')
        statusRef.current = 'playing'
        window.speechSynthesis.speak(utter)
        return
      }

      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(u.text)
      utter.rate = rateRef.current
      const voice = pickVoice()
      if (voice) utter.voice = voice
      utter.onend = () => {
        if (statusRef.current !== 'playing') return
        const next = indexRef.current + 1
        if (next >= utterancesRef.current.length) {
          setStatus('idle')
          statusRef.current = 'idle'
          return
        }
        speakAt(next)
      }
      utter.onerror = () => {
        setStatus('idle')
        statusRef.current = 'idle'
      }
      setStatus('playing')
      statusRef.current = 'playing'
      window.speechSynthesis.speak(utter)
    },
    [pickVoice],
  )

  const play = useCallback(() => {
    if (!speechSupported()) return
    if (statusRef.current === 'paused') {
      window.speechSynthesis.resume()
      setStatus('playing')
      statusRef.current = 'playing'
      return
    }
    if (statusRef.current === 'waiting') {
      // Continue past quiz pause
      speakAt(indexRef.current + 1)
      return
    }
    speakAt(indexRef.current)
  }, [speakAt])

  const pause = useCallback(() => {
    if (!speechSupported()) return
    if (statusRef.current === 'playing') {
      window.speechSynthesis.pause()
      setStatus('paused')
      statusRef.current = 'paused'
    }
  }, [])

  const stop = useCallback(() => {
    if (!speechSupported()) return
    window.speechSynthesis.cancel()
    indexRef.current = 0
    setIndex(0)
    setStatus('idle')
    statusRef.current = 'idle'
  }, [])

  const next = useCallback(() => {
    if (statusRef.current === 'waiting') {
      speakAt(indexRef.current + 1)
      return
    }
    const n = indexRef.current + 1
    if (n >= utterancesRef.current.length) {
      stop()
      return
    }
    speakAt(n)
  }, [speakAt, stop])

  const prev = useCallback(() => {
    const n = Math.max(0, indexRef.current - 1)
    speakAt(n)
  }, [speakAt])

  const setRate = useCallback((r: number) => {
    setRateState(r)
    try {
      localStorage.setItem(RATE_KEY, String(r))
    } catch {
      /* ignore */
    }
  }, [])

  const setVoiceUri = useCallback((uri: string) => {
    setVoiceUriState(uri)
    try {
      localStorage.setItem(VOICE_KEY, uri)
    } catch {
      /* ignore */
    }
  }, [])

  const current = utterances[index] ?? null
  const progressLabel = useMemo(() => {
    if (!utterances.length) return ''
    return `${index + 1} of ${utterances.length}`
  }, [index, utterances.length])

  return {
    supported: speechSupported(),
    status,
    index,
    current,
    progressLabel,
    rate,
    setRate,
    voices,
    voiceUri,
    setVoiceUri,
    play,
    pause,
    stop,
    next,
    prev,
    total: utterances.length,
  }
}
