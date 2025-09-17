import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { useToast } from '../hooks/use-toast';
import { 
  Calendar, 
  Users, 
  Trophy, 
  User, 
  Clock, 
  FileText, 
  Shield, 
  ArrowLeft,
  UserPlus
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await axios.get(`${API}/tournaments/${id}`);
        setTournament(response.data.tournament);
      } catch (error) {
        console.error('Error fetching tournament:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
        <p className="text-slate-600">Cargando torneo...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Torneo No Encontrado</h2>
        <p className="text-slate-600 mb-6">El torneo que buscas no existe o ha sido eliminado.</p>
        <Button onClick={() => navigate('/tournaments')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Torneos
        </Button>
      </div>
    );
  }

  const statusColors = {
    registration: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800'
  };

  const statusLabels = {
    registration: 'Inscripciones Abiertas',
    active: 'En Progreso',
    completed: 'Completado'
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleJoinTournament = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia Sesión",
        description: "Debes iniciar sesión para unirte a un torneo.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setJoining(true);
    try {
      const response = await axios.post(`${API}/tournaments/${id}/join`);
      setTournament(response.data.tournament);
      toast({
        title: "¡Te has unido!",
        description: response.data.message,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "No se pudo unir al torneo.",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  const canJoin = tournament.status === 'registration' && 
                 tournament.participants < tournament.maxParticipants;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/tournaments')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a Torneos
      </Button>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{tournament.name}</h1>
            <p className="text-xl text-slate-600 mt-2">{tournament.game}</p>
          </div>
          <Badge className={`${statusColors[tournament.status]} border-0 text-sm px-4 py-2`}>
            {statusLabels[tournament.status]}
          </Badge>
        </div>

        {canJoin && (
          <Button 
            size="lg"
            onClick={handleJoinTournament}
            disabled={joining}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
          >
            {joining ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uniéndose...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-5 w-5" />
                Unirse al Torneo
              </>
            )}
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Descripción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed">{tournament.description}</p>
            </CardContent>
          </Card>

          {/* Rules */}
          {tournament.rules && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Reglas del Torneo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed">{tournament.rules}</p>
              </CardContent>
            </Card>
          )}

          {/* Judges */}
          {tournament.judges && tournament.judges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Jueces
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tournament.judges.map((judge, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {judge}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Torneo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500">Organizador</p>
                  <p className="font-medium">{tournament.organizerName}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500">Participantes</p>
                  <p className="font-medium">
                    {tournament.participants.length} / {tournament.maxParticipants}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500">Premio</p>
                  <p className="font-medium">{tournament.prize || 'No especificado'}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500">Creado</p>
                  <p className="font-medium">{formatDate(tournament.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Cronograma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Límite de Inscripción</p>
                <p className="font-medium">{formatDate(tournament.registrationDeadline)}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-slate-500 mb-1">Fecha de Inicio</p>
                <p className="font-medium">{formatDate(tournament.startDate)}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-slate-500 mb-1">Fecha de Finalización</p>
                <p className="font-medium">{formatDate(tournament.endDate)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Join Status */}
          <Card>
            <CardContent className="pt-6">
              {tournament.status === 'registration' ? (
                <div className="text-center">
                  {tournament.participants.length < tournament.maxParticipants ? (
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <UserPlus className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800">Inscripciones Abiertas</p>
                        <p className="text-sm text-green-600">
                          {tournament.maxParticipants - tournament.participants.length} lugares disponibles
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <Users className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-red-800">Torneo Lleno</p>
                        <p className="text-sm text-red-600">
                          No hay lugares disponibles
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : tournament.status === 'active' ? (
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Trophy className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-800">En Progreso</p>
                    <p className="text-sm text-blue-600">
                      El torneo está actualmente en curso
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Trophy className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Completado</p>
                    <p className="text-sm text-gray-600">
                      Este torneo ha terminado
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetails;