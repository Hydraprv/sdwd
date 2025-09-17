import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  User, 
  Mail, 
  Trophy, 
  Calendar, 
  Users, 
  Edit,
  Settings,
  LogOut
} from 'lucide-react';
import { mockTournaments, mockStats } from '../mock';

const Profile = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Mock user statistics
  const userTournaments = mockTournaments.filter(t => t.organizer === user.username);
  const userStats = {
    tournamentsCreated: userTournaments.length,
    tournamentsWon: 3,
    tournamentsParticipated: 12,
    totalPrizes: '$2,500'
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold text-slate-900">Mi Perfil</h1>
        <p className="text-slate-600 mt-2">Administra tu cuenta y estadísticas</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback className="text-xl">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{user.username}</h2>
                  <p className="text-slate-600">{user.email}</p>
                </div>

                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Config
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                onClick={() => navigate('/create-tournament')}
              >
                <Trophy className="mr-2 h-4 w-4" />
                Crear Torneo
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/tournaments')}
              >
                <Users className="mr-2 h-4 w-4" />
                Ver Torneos
              </Button>
              <Separator />
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Mis Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {userStats.tournamentsCreated}
                  </div>
                  <div className="text-sm text-slate-600">Torneos Creados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {userStats.tournamentsParticipated}
                  </div>
                  <div className="text-sm text-slate-600">Participaciones</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {userStats.tournamentsWon}
                  </div>
                  <div className="text-sm text-slate-600">Torneos Ganados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">
                    {userStats.totalPrizes}
                  </div>
                  <div className="text-sm text-slate-600">Premios Ganados</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Tournaments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Mis Torneos</span>
                <Badge variant="outline">{userTournaments.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userTournaments.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">No has creado ningún torneo aún</p>
                  <Button 
                    onClick={() => navigate('/create-tournament')}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                  >
                    Crear Mi Primer Torneo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userTournaments.map((tournament) => (
                    <div 
                      key={tournament.id} 
                      className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/tournament/${tournament.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors">
                            {tournament.name}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">{tournament.game}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {tournament.participants}/{tournament.maxParticipants}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(tournament.startDate)}
                            </span>
                          </div>
                        </div>
                        <Badge 
                          className={
                            tournament.status === 'registration' ? 'bg-blue-100 text-blue-800' :
                            tournament.status === 'active' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {tournament.status === 'registration' ? 'Abierto' :
                           tournament.status === 'active' ? 'Activo' : 'Completado'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500">Nombre de Usuario</p>
                  <p className="font-medium">{user.username}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500">Correo Electrónico</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-500">Miembro desde</p>
                  <p className="font-medium">Julio 2024</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;