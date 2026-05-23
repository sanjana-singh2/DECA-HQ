import { useState, useEffect } from 'react';
import { Event } from '../types';
import { getAllEvents, getUpcomingEvents } from '../services/eventsService';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getAllEvents();
      setEvents(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, error, refetch: fetchEvents };
}

export function useUpcomingEvents(limit = 5) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUpcomingEvents(limit)
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [limit]);

  return { events, loading };
}
