import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, Users, Trophy, User } from 'lucide-react';

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

const TournamentCard = ({ tournament }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-slate-200 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
              {tournament.name}
            </h3>
            <p className="text-sm text-slate-600 mt-1">{tournament.game}</p>
          </div>
          <Badge className={`${statusColors[tournament.status]} border-0`}>
            {statusLabels[tournament.status]}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-600 line-clamp-2">
          {tournament.description}
        </p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-slate-600">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(tournament.startDate)}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600">
            <Users className="h-4 w-4" />
            <span>{tournament.participants}/{tournament.maxParticipants}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600">
            <Trophy className="h-4 w-4" />
            <span>{tournament.prize}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600">
            <User className="h-4 w-4" />
            <span className="truncate">{tournament.organizer}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Link to={`/tournament/${tournament.id}`} className="w-full">
          <Button 
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
          >
            Ver Detalles
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default TournamentCard;