import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import TournamentCard from '../components/TournamentCard';
import { mockGames } from '../mock';
import { Search, Filter, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Tournaments = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, [selectedGame, selectedStatus, searchTerm]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedGame !== 'all') {
        params.append('game', selectedGame);
      }
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await axios.get(`${API}/tournaments?${params.toString()}`);
      setTournaments(response.data.tournaments);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'Todos los Estados' },
    { value: 'registration', label: 'Inscripciones Abiertas' },
    { value: 'active', label: 'En Progreso' },
    { value: 'completed', label: 'Completados' }
  ];

  const statusLabels = {
    registration: 'Inscripciones Abiertas',
    active: 'En Progreso',
    completed: 'Completado'
  };

  // Tournaments are already filtered by the API
  const filteredTournaments = tournaments;

  const getStatusCounts = () => {
    return {
      all: tournaments.length,
      registration: tournaments.filter(t => t.status === 'registration').length,
      active: tournaments.filter(t => t.status === 'active').length,
      completed: tournaments.filter(t => t.status === 'completed').length
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Torneos</h1>
          <p className="text-slate-600 mt-2">
            Descubre y participa en torneos competitivos
          </p>
        </div>
        {isAuthenticated && (
          <Button 
            onClick={() => navigate('/create-tournament')}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear Torneo
          </Button>
        )}
      </div>

      {/* Status Filter Badges */}
      <div className="flex flex-wrap gap-3">
        {statusOptions.map(option => (
          <Badge
            key={option.value}
            variant={selectedStatus === option.value ? "default" : "outline"}
            className={`cursor-pointer transition-colors px-4 py-2 ${
              selectedStatus === option.value 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            onClick={() => setSelectedStatus(option.value)}
          >
            {option.label} ({statusCounts[option.value]})
          </Badge>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar torneos, juegos o organizadores..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Debounce search to avoid too many API calls
                  clearTimeout(window.searchTimeout);
                  window.searchTimeout = setTimeout(() => {
                    fetchTournaments();
                  }, 500);
                }}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="md:w-48">
            <Select value={selectedGame} onValueChange={setSelectedGame}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por juego" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Juegos</SelectItem>
                {mockGames.map(game => (
                  <SelectItem key={game.id} value={game.name}>
                    {game.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600">
            {filteredTournaments.length} torneo{filteredTournaments.length !== 1 ? 's' : ''} encontrado{filteredTournaments.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
            <p className="text-slate-600">Cargando torneos...</p>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontraron torneos</h3>
            <p className="text-slate-600 mb-6">
              Intenta ajustar los filtros o crear un nuevo torneo.
            </p>
            {isAuthenticated && (
              <Button 
                onClick={() => navigate('/create-tournament')}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Crear Primer Torneo
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map(tournament => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tournaments;