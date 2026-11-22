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

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 3000,
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
        console.error('Broker error: ' + frame.headers['message']);
        setIsConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, []);

  return { isConnected, latency };
};
