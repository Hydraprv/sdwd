import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useToast } from '../hooks/use-toast';
import { mockGames } from '../mock';
import { Plus, Calendar, Users, Trophy, FileText, User, Loader2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CreateTournament = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    game: '',
    description: '',
    rules: '',
    maxParticipants: '',
    prize: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    judges: ''
  });
  const [errors, setErrors] = useState({});

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0];

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del torneo es requerido';
    }

    if (!formData.game) {
      newErrors.game = 'Selecciona un juego';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.maxParticipants) {
      newErrors.maxParticipants = 'El número de participantes es requerido';
    } else if (parseInt(formData.maxParticipants) < 2) {
      newErrors.maxParticipants = 'Mínimo 2 participantes';
    } else if (parseInt(formData.maxParticipants) > 128) {
      newErrors.maxParticipants = 'Máximo 128 participantes';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    } else if (formData.startDate < today) {
      newErrors.startDate = 'La fecha de inicio no puede ser en el pasado';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'La fecha de finalización es requerida';
    } else if (formData.endDate < formData.startDate) {
      newErrors.endDate = 'La fecha de fin debe ser posterior al inicio';
    }

    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = 'La fecha límite de inscripción es requerida';
    } else if (formData.registrationDeadline < today) {
      newErrors.registrationDeadline = 'La fecha límite no puede ser en el pasado';
    } else if (formData.registrationDeadline > formData.startDate) {
      newErrors.registrationDeadline = 'La fecha límite debe ser antes del inicio del torneo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Convert form data to API format
      const tournamentData = {
        name: formData.name,
        game: formData.game,
        description: formData.description,
        rules: formData.rules,
        maxParticipants: parseInt(formData.maxParticipants),
        prize: formData.prize,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        registrationDeadline: new Date(formData.registrationDeadline).toISOString(),
        judges: formData.judges.split(',').map(j => j.trim()).filter(j => j.length > 0)
      };

      const response = await axios.post(`${API}/tournaments`, tournamentData);
      
      toast({
        title: "¡Torneo Creado!",
        description: `${formData.name} ha sido creado exitosamente.`,
      });
      
      navigate('/tournaments');
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Hubo un problema al crear el torneo. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Plus className="h-8 w-8 text-emerald-600" />
          Crear Nuevo Torneo
        </h1>
        <p className="text-slate-600 mt-2">
          Organiza un torneo competitivo para la comunidad gaming
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información Básica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Torneo *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ej: Valorant Championship 2024"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'border-red-300 focus:border-red-500' : ''}
                />
                {errors.name && (
                  <Alert className="py-2">
                    <AlertDescription className="text-sm text-red-600">
                      {errors.name}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="game">Juego *</Label>
                <Select value={formData.game} onValueChange={(value) => handleSelectChange('game', value)}>
                  <SelectTrigger className={errors.game ? 'border-red-300 focus:border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona un juego" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockGames.map(game => (
                      <SelectItem key={game.id} value={game.name}>
                        {game.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.game && (
                  <Alert className="py-2">
                    <AlertDescription className="text-sm text-red-600">
                      {errors.game}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe tu torneo, formato, premios, etc."
                value={formData.description}
                onChange={handleChange}
                className={`min-h-[100px] ${errors.description ? 'border-red-300 focus:border-red-500' : ''}`}
              />
              {errors.description && (
                <Alert className="py-2">
                  <AlertDescription className="text-sm text-red-600">
                    {errors.description}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rules">Reglas del Torneo</Label>
              <Textarea
                id="rules"
                name="rules"
                placeholder="Especifica las reglas y formato del torneo (opcional)"
                value={formData.rules}
                onChange={handleChange}
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tournament Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Configuración del Torneo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Máximo de Participantes *</Label>
                <Input
                  id="maxParticipants"
                  name="maxParticipants"
                  type="number"
                  min="2"
                  max="128"
                  placeholder="16"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  className={errors.maxParticipants ? 'border-red-300 focus:border-red-500' : ''}
                />
                {errors.maxParticipants && (
                  <Alert className="py-2">
                    <AlertDescription className="text-sm text-red-600">
                      {errors.maxParticipants}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="prize">Premio (opcional)</Label>
                <Input
                  id="prize"
                  name="prize"
                  placeholder="Ej: $1,000 o Trofeo Digital"
                  value={formData.prize}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="judges">Jueces (opcional)</Label>
              <Input
                id="judges"
                name="judges"
                placeholder="Nombres de los jueces separados por comas"
                value={formData.judges}
                onChange={handleChange}
              />
              <p className="text-sm text-slate-500">
                Ej: JudgeAdmin, ProRef, GameMaster
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Fechas del Torneo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="registrationDeadline">Fecha Límite de Inscripción *</Label>
                <Input
                  id="registrationDeadline"
                  name="registrationDeadline"
                  type="date"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  className={errors.registrationDeadline ? 'border-red-300 focus:border-red-500' : ''}
                />
                {errors.registrationDeadline && (
                  <Alert className="py-2">
                    <AlertDescription className="text-sm text-red-600">
                      {errors.registrationDeadline}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de Inicio *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={errors.startDate ? 'border-red-300 focus:border-red-500' : ''}
                />
                {errors.startDate && (
                  <Alert className="py-2">
                    <AlertDescription className="text-sm text-red-600">
                      {errors.startDate}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de Finalización *</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={errors.endDate ? 'border-red-300 focus:border-red-500' : ''}
                />
                {errors.endDate && (
                  <Alert className="py-2">
                    <AlertDescription className="text-sm text-red-600">
                      {errors.endDate}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/tournaments')}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando Torneo...
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-4 w-4" />
                Crear Torneo
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTournament;