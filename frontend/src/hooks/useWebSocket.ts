import { useEffect, useState, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Bed, AuditLog } from '../types';

interface UseWebSocketOptions {
  onBedUpdate?: (bed: Bed) => void;
  onAuditLog?: (log: AuditLog) => void;
}

export const useWebSocket = ({ onBedUpdate, onAuditLog }: UseWebSocketOptions = {}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latency, setLatency] = useState<number>(38);
  const clientRef = useRef<Client | null>(null);

  const onBedUpdateRef = useRef(onBedUpdate);
  const onAuditLogRef = useRef(onAuditLog);

  useEffect(() => {
    onBedUpdateRef.current = onBedUpdate;
    onAuditLogRef.current = onAuditLog;
  }, [onBedUpdate, onAuditLog]);

  const connect = useCallback(() => {
    if (clientRef.current && clientRef.current.active) {
      try {
        clientRef.current.deactivate();
      } catch (e) {
        // ignore
      }
    }

    const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
    const customWs = (import.meta as any).env?.VITE_WS_URL;

    // If hosted on Vercel without an external cloud WebSocket tunnel configured, skip local polling
    if (isVercel && !customWs) {
      setIsConnected(false);
      return;
    }

    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const wsUrl =
      customWs ||
      (isHttps ? '/ws' : window.location.port === '5173' ? '/ws' : 'http://localhost:8080/ws');

    try {
      const socket = new SockJS(wsUrl, null, {
        transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
      });

      const client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          setIsConnected(true);
          // Subscribe to beds topic
          client.subscribe('/topic/beds', (message) => {
            try {
              const bed: Bed = JSON.parse(message.body);
              if (onBedUpdateRef.current) {
                onBedUpdateRef.current(bed);
              }
            } catch (e) {
              console.error('Error parsing bed message:', e);
            }
          });

          // Subscribe to audit topic
          client.subscribe('/topic/audit', (message) => {
            try {
              const audit: AuditLog = JSON.parse(message.body);
              if (audit.latencyMs) {
                setLatency(audit.latencyMs);
              }
              if (onAuditLogRef.current) {
                onAuditLogRef.current(audit);
              }
            } catch (e) {
              console.error('Error parsing audit message:', e);
            }
          });
        },
        onDisconnect: () => {
          setIsConnected(false);
        },
        onStompError: (frame) => {
          console.warn('Broker error: ' + (frame.headers ? frame.headers['message'] : 'unknown'));
          setIsConnected(false);
        },
        onWebSocketClose: () => {
          setIsConnected(false);
        },
      });

      client.activate();
      clientRef.current = client;
    } catch (err) {
      console.warn('WebSocket connection not initialized (insecure or unavailable):', err);
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (clientRef.current && clientRef.current.active) {
        try {
          clientRef.current.deactivate();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [connect]);

  const reconnect = useCallback(() => {
    connect();
  }, [connect]);

  return { isConnected, latency, reconnect };
};
