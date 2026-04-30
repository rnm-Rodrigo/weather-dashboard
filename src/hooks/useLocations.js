import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchLocations();
    }
  }, [user]);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const addLocation = async (cityName) => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert([{ city_name: cityName, user_id: user.id }])
        .select();

      if (error) throw error;
      setLocations([...locations, data[0]]);
    } catch (error) {
      console.error('Error adding location:', error.message);
    }
  };

  // NEW: Function to delete a location from Supabase
  const removeLocation = async (id) => {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id); // Deletes the row where the ID matches

      if (error) throw error;
      
      // Update the screen by filtering out the deleted city
      setLocations(locations.filter(loc => loc.id !== id));
    } catch (error) {
      console.error('Error deleting location:', error.message);
    }
  };

  // Don't forget to return removeLocation here!
  return { locations, loading, addLocation, removeLocation };
}