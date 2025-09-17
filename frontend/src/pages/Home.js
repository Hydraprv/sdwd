import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Trophy, Users, Calendar, TrendingUp, Gamepad2, Zap, Plus } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    totalPlayers: 0,
    totalPrizePool: '$0'
  });
  const [featuredTournaments, setFeaturedTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch platform stats
        const statsResponse = await axios.get(`${API}/stats`);
        setStats(statsResponse.data);

        // Fetch tournaments for featured section
        const tournamentsResponse = await axios.get(`${API}/tournaments?status=registration`);
        setFeaturedTournaments(tournamentsResponse.data.tournaments.slice(0, 3));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: Trophy,
      title: "Torneos Competitivos",
      description: "Organiza y participa en torneos de tus juegos favoritos con premios reales."
    },
    {
      icon: Users,
      title: "Comunidad Activa",
      description: "Únete a miles de jugadores y forma equipos para competir juntos."
    },
    {
      icon: Calendar,
      title: "Gestión Completa",
      description: "Herramientas completas para organizar, gestionar y seguir torneos."
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900">
            La Plataforma de
            <span className="block bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
              Torneos Esports
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Crea, organiza y participa in torneos de videojuegos competitivos. 
            Conecta con jugadores de todo el mundo y compite por premios increíbles.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {isAuthenticated ? (
            <>
              <Button 
                size="lg" 
                onClick={() => navigate('/create-tournament')}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 text-lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Crear Torneo
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/tournaments')}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-8 py-3 text-lg"
              >
                <Trophy className="mr-2 h-5 w-5" />
                Ver Torneos
              </Button>
            </>
          ) : (
            <>
              <Button 
                size="lg" 
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 text-lg"
              >
                <Zap className="mr-2 h-5 w-5" />
                Comenzar Ahora
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/tournaments')}
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-8 py-3 text-lg"
              >
                <Trophy className="mr-2 h-5 w-5" />
                Explorar Torneos
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">{stats.totalTournaments}</div>
            <div className="text-sm text-slate-600 mt-1">Torneos Totales</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600">{stats.activeTournaments}</div>
            <div className="text-sm text-slate-600 mt-1">Torneos Activos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-700">{stats.totalPlayers.toLocaleString()}</div>
            <div className="text-sm text-slate-600 mt-1">Jugadores</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">{stats.totalPrizePool}</div>
            <div className="text-sm text-slate-600 mt-1">Premios Totales</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            ¿Por qué elegir TourneyHub?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Ofrecemos las mejores herramientas para organizar torneos competitivos y conectar con la comunidad gaming.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow border-slate-200">
              <CardHeader className="pb-4">
                <div className="mx-auto w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Tournaments */}
      {featuredTournaments.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Torneos Destacados</h2>
              <p className="text-slate-600 mt-2">Inscripciones abiertas ahora</p>
            </div>
            <Link to="/tournaments">
              <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                Ver Todos
                <TrendingUp className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredTournaments.map((tournament) => (
              <Card key={tournament.id} className="hover:shadow-lg transition-shadow border-slate-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{tournament.name}</h3>
                      <p className="text-sm text-slate-600">{tournament.game}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-0">
                      Abierto
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {tournament.participants}/{tournament.maxParticipants}
                    </span>
                    <span className="flex items-center">
                      <Trophy className="h-4 w-4 mr-1" />
                      {tournament.prize}
                    </span>
                  </div>
                  <Link to={`/tournament/${tournament.id}`}>
                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white">
                      Ver Detalles
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-12 text-center text-white">
          <div className="space-y-4">
            <Gamepad2 className="h-16 w-16 mx-auto opacity-90" />
            <h2 className="text-3xl font-bold">¿Listo para competir?</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Únete a nuestra comunidad de gamers y comienza a participar en torneos épicos hoy mismo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/register')}
                className="bg-white text-emerald-600 hover:bg-slate-50 px-8 py-3 text-lg font-semibold"
              >
                Crear Cuenta
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/login')}
                className="border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-3 text-lg"
              >
                Iniciar Sesión
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;